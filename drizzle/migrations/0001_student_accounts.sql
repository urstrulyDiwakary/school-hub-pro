CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_role public.app_role;
BEGIN
  INSERT INTO public.profiles(id, full_name, email)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name',''), coalesce(NEW.email,''));
  IF (NEW.raw_app_meta_data->>'staff_role') IN ('school_admin','teacher','accountant','student') THEN
    v_role := (NEW.raw_app_meta_data->>'staff_role')::public.app_role;
  ELSIF NEW.raw_user_meta_data->>'setup_admin' = 'true'
        AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'school_admin') THEN
    v_role := 'school_admin';
  ELSE
    v_role := 'parent';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, v_role);
  RETURN NEW;
END $function$;

CREATE POLICY "students read student announcements" ON public.announcements FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'student') AND audiences && ARRAY['all','students']);