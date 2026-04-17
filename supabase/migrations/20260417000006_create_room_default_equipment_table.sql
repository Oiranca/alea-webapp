CREATE TABLE IF NOT EXISTS "public"."room_default_equipment" (
    "room_id" "uuid" NOT NULL,
    "equipment_id" "uuid" NOT NULL,
    CONSTRAINT "room_default_equipment_pkey" PRIMARY KEY ("room_id", "equipment_id"),
    CONSTRAINT "room_default_equipment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "room_default_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."room_default_equipment" OWNER TO "postgres";
ALTER TABLE "public"."room_default_equipment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_default_equipment_admin_delete" ON "public"."room_default_equipment" FOR DELETE TO "authenticated" USING ("public"."is_admin"());
CREATE POLICY "room_default_equipment_admin_insert" ON "public"."room_default_equipment" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());
CREATE POLICY "room_default_equipment_select" ON "public"."room_default_equipment" FOR SELECT TO "authenticated" USING (true);

GRANT SELECT ON TABLE "public"."room_default_equipment" TO "anon";
GRANT ALL ON TABLE "public"."room_default_equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."room_default_equipment" TO "service_role";
