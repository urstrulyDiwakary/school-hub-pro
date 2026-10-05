CREATE TYPE public.app_role AS ENUM ('school_admin','teacher','accountant','parent','student');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('school_admin','teacher','accountant'))
$$;

CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'school_admin'));
CREATE POLICY "own or staff profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  class_name text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  roll_no integer,
  class_teacher text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.parent_students (
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, student_id)
);
GRANT SELECT ON public.parent_students TO authenticated;
GRANT ALL ON public.parent_students TO service_role;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_parent_of(_user_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = _user_id AND student_id = _student_id)
$$;

CREATE POLICY "staff manage students" ON public.students FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "parents read own children" ON public.students FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), id));
CREATE POLICY "read own links" ON public.parent_students FOR SELECT TO authenticated USING (parent_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.student_join_codes (
  code text PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_by uuid,
  used_at timestamptz
);
GRANT SELECT, INSERT, DELETE ON public.student_join_codes TO authenticated;
GRANT ALL ON public.student_join_codes TO service_role;
ALTER TABLE public.student_join_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage codes" ON public.student_join_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher')) WITH CHECK (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher'));

CREATE OR REPLACE FUNCTION public.redeem_join_code(_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_student uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'parent') THEN
    RAISE EXCEPTION 'Only parent accounts can use a child code';
  END IF;
  SELECT student_id INTO v_student FROM public.student_join_codes
   WHERE code = upper(trim(_code)) AND used_by IS NULL FOR UPDATE;
  IF v_student IS NULL THEN
    RAISE EXCEPTION 'This code is not valid or was already used';
  END IF;
  UPDATE public.student_join_codes SET used_by = auth.uid(), used_at = now() WHERE code = upper(trim(_code));
  INSERT INTO public.parent_students(parent_id, student_id) VALUES (auth.uid(), v_student) ON CONFLICT DO NOTHING;
  RETURN v_student;
END $$;
REVOKE EXECUTE ON FUNCTION public.redeem_join_code(text) FROM anon;

-- Attendance & results
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present','absent','late','holiday')),
  marked_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT ALL ON public.attendance_records TO service_role;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff write attendance" ON public.attendance_records FOR ALL TO authenticated USING (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher')) WITH CHECK (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "parents read attendance" ON public.attendance_records FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));

CREATE TABLE public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  term text NOT NULL DEFAULT '',
  exam_date date NOT NULL DEFAULT current_date,
  subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  class_rank integer,
  total_students integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_results TO authenticated;
GRANT ALL ON public.exam_results TO service_role;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff write results" ON public.exam_results FOR ALL TO authenticated USING (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher')) WITH CHECK (public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "parents read results" ON public.exam_results FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));

-- Announcements
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'notice',
  title text NOT NULL,
  message text NOT NULL,
  audiences text[] NOT NULL DEFAULT ARRAY['all'],
  channels text[] NOT NULL DEFAULT ARRAY['in_app'],
  pinned boolean NOT NULL DEFAULT false,
  effective_date date,
  created_by uuid,
  created_by_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read all announcements" ON public.announcements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "parents read parent announcements" ON public.announcements FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'parent') AND audiences && ARRAY['all','parents']);
CREATE POLICY "admin teacher publish" ON public.announcements FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'teacher')) AND created_by = auth.uid());
CREATE POLICY "admin or author delete" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'school_admin') OR created_by = auth.uid());

-- Messaging
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  parent_name text NOT NULL DEFAULT '',
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  recipient text NOT NULL CHECK (recipient IN ('class_teacher','principal','accounts','transport')),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.message_threads TO authenticated;
GRANT ALL ON public.message_threads TO service_role;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_handle_thread(_user_id uuid, _recipient text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'school_admin')
      OR (_recipient = 'class_teacher' AND public.has_role(_user_id,'teacher'))
      OR (_recipient = 'accounts' AND public.has_role(_user_id,'accountant'))
$$;

CREATE OR REPLACE FUNCTION public.can_access_thread(_user_id uuid, _thread_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = _thread_id
    AND (t.parent_id = _user_id OR public.can_handle_thread(_user_id, t.recipient)))
$$;

CREATE POLICY "parent own threads" ON public.message_threads FOR SELECT TO authenticated USING (parent_id = auth.uid() OR public.can_handle_thread(auth.uid(), recipient));
CREATE POLICY "parent create thread" ON public.message_threads FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid() AND public.has_role(auth.uid(),'parent') AND (student_id IS NULL OR public.is_parent_of(auth.uid(), student_id)));
CREATE POLICY "staff update thread" ON public.message_threads FOR UPDATE TO authenticated USING (public.can_handle_thread(auth.uid(), recipient) OR parent_id = auth.uid());

CREATE TABLE public.thread_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  sender_role text NOT NULL DEFAULT '',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.thread_messages TO authenticated;
GRANT ALL ON public.thread_messages TO service_role;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "thread participants read" ON public.thread_messages FOR SELECT TO authenticated USING (public.can_access_thread(auth.uid(), thread_id));
CREATE POLICY "thread participants write" ON public.thread_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.can_access_thread(auth.uid(), thread_id));

CREATE OR REPLACE FUNCTION public.touch_thread() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.message_threads SET updated_at = now() WHERE id = NEW.thread_id; RETURN NEW; END $$;
CREATE TRIGGER thread_messages_touch AFTER INSERT ON public.thread_messages FOR EACH ROW EXECUTE FUNCTION public.touch_thread();

-- New user: profile + role. Public sign-up is always a parent, except the very
-- first account which may set up the school admin.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role public.app_role;
BEGIN
  INSERT INTO public.profiles(id, full_name, email)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name',''), coalesce(NEW.email,''));
  IF (NEW.raw_app_meta_data->>'staff_role') IN ('school_admin','teacher','accountant') THEN
    v_role := (NEW.raw_app_meta_data->>'staff_role')::public.app_role;
  ELSIF NEW.raw_user_meta_data->>'setup_admin' = 'true'
        AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'school_admin') THEN
    v_role := 'school_admin';
  ELSE
    v_role := 'parent';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, v_role);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.school_has_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'school_admin')
$$;
GRANT EXECUTE ON FUNCTION public.school_has_admin() TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.thread_messages, public.message_threads, public.announcements;