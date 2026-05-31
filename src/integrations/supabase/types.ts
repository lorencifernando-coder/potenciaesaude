export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          data_hora: string
          duracao_min: number
          google_event_id: string | null
          google_meet_link: string | null
          id: string
          inscricao_id: string
          status: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          duracao_min?: number
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          inscricao_id: string
          status?: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          duracao_min?: number
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          inscricao_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          antecedencia_min_horas: number
          consulta_valor: number
          google_calendar_id: string | null
          google_refresh_token: string | null
          id: number
          slot_duracao_min: number
          updated_at: string
        }
        Insert: {
          antecedencia_min_horas?: number
          consulta_valor?: number
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: number
          slot_duracao_min?: number
          updated_at?: string
        }
        Update: {
          antecedencia_min_horas?: number
          consulta_valor?: number
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: number
          slot_duracao_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      disponibilidade_config: {
        Row: {
          ativo: boolean
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: []
      }
      inscricoes: {
        Row: {
          altura: number | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          clinicas: Json | null
          comorbidades: string[] | null
          complemento: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          estado: string | null
          habitos: string[] | null
          id: string
          logradouro: string | null
          matinal: string | null
          nome: string
          notificado: boolean
          numero: string | null
          objetivo: string | null
          payment_amount: number
          payment_id: string | null
          payment_link: string | null
          payment_status: string
          pde5: string | null
          peso: number | null
          queixas: string[] | null
          sexo: string | null
          telefone: string
        }
        Insert: {
          altura?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinicas?: Json | null
          comorbidades?: string[] | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          estado?: string | null
          habitos?: string[] | null
          id?: string
          logradouro?: string | null
          matinal?: string | null
          nome: string
          notificado?: boolean
          numero?: string | null
          objetivo?: string | null
          payment_amount?: number
          payment_id?: string | null
          payment_link?: string | null
          payment_status?: string
          pde5?: string | null
          peso?: number | null
          queixas?: string[] | null
          sexo?: string | null
          telefone: string
        }
        Update: {
          altura?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinicas?: Json | null
          comorbidades?: string[] | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          estado?: string | null
          habitos?: string[] | null
          id?: string
          logradouro?: string | null
          matinal?: string | null
          nome?: string
          notificado?: boolean
          numero?: string | null
          objetivo?: string | null
          payment_amount?: number
          payment_id?: string | null
          payment_link?: string | null
          payment_status?: string
          pde5?: string | null
          peso?: number | null
          queixas?: string[] | null
          sexo?: string | null
          telefone?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          crm: string
          email_contato: string | null
          empresa_descricao: string | null
          empresa_nome: string
          empresa_slogan: string | null
          especialidade: string | null
          estado: string | null
          favicon_url: string | null
          footer_aviso_legal: string | null
          footer_links: Json
          footer_texto: string | null
          foto_principal_url: string | null
          gcal_calendar_id: string | null
          gcal_calendar_link_publico: string | null
          gcal_ics_url: string | null
          header_cta_texto: string | null
          header_links: Json
          id: number
          logo_url: string | null
          logradouro: string | null
          medico_nome: string
          mp_public_key: string | null
          numero: string | null
          redes_sociais: Json
          telefone: string | null
          updated_at: string
          video_youtube_url: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          crm?: string
          email_contato?: string | null
          empresa_descricao?: string | null
          empresa_nome?: string
          empresa_slogan?: string | null
          especialidade?: string | null
          estado?: string | null
          favicon_url?: string | null
          footer_aviso_legal?: string | null
          footer_links?: Json
          footer_texto?: string | null
          foto_principal_url?: string | null
          gcal_calendar_id?: string | null
          gcal_calendar_link_publico?: string | null
          gcal_ics_url?: string | null
          header_cta_texto?: string | null
          header_links?: Json
          id?: number
          logo_url?: string | null
          logradouro?: string | null
          medico_nome?: string
          mp_public_key?: string | null
          numero?: string | null
          redes_sociais?: Json
          telefone?: string | null
          updated_at?: string
          video_youtube_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          crm?: string
          email_contato?: string | null
          empresa_descricao?: string | null
          empresa_nome?: string
          empresa_slogan?: string | null
          especialidade?: string | null
          estado?: string | null
          favicon_url?: string | null
          footer_aviso_legal?: string | null
          footer_links?: Json
          footer_texto?: string | null
          foto_principal_url?: string | null
          gcal_calendar_id?: string | null
          gcal_calendar_link_publico?: string | null
          gcal_ics_url?: string | null
          header_cta_texto?: string | null
          header_links?: Json
          id?: number
          logo_url?: string | null
          logradouro?: string | null
          medico_nome?: string
          mp_public_key?: string | null
          numero?: string | null
          redes_sociais?: Json
          telefone?: string | null
          updated_at?: string
          video_youtube_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
