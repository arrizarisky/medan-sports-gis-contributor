import { Kecamatan } from "../types";
import { supabase } from "../lib/supabase";

export const kecamatanService = {
  async getAll() {
    const { data, error } = await supabase
      .from("kecamatans")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Kecamatan[];
  },
};
