import { Facility } from "../types";
import { supabase } from "../lib/supabase";

export const facilityService = {
  async getAll() {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Facility[];
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Facility[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Facility;
  },

  async create(facility: Omit<Facility, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("facilities")
      .insert([facility])
      .select();

    if (error) throw error;
    return data[0] as Facility;
  },

  async update(id: string, facility: Partial<Facility>) {
    const { data, error } = await supabase
      .from("facilities")
      .update(facility)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as Facility;
  },

  async delete(id: string) {
    const { error } = await supabase.from("facilities").delete().eq("id", id);

    if (error) throw error;
  },

  async uploadPhoto(file: File, userId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `facility-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("facility-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("facility-photos").getPublicUrl(filePath);

    return publicUrl;
  },
};
