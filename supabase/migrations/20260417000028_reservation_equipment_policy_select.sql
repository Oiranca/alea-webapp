CREATE POLICY "reservation_equipment_select" ON "public"."reservation_equipment" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."reservations"
  WHERE (("reservations"."id" = "reservation_equipment"."reservation_id") AND (((("reservations"."user_id" = "auth"."uid"()) AND "public"."is_active_member"()) OR "public"."is_admin"()))))));
