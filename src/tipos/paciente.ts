// Tipos baseados em HL7 FHIR para o MonitorAVC

export type StatusMonitoramento = 
  | "aguarda_analise"
  | "aguarda_exames"
  | "aguarda_agendamento"
  | "aguarda_desfecho"
  | "sem_criterio_monitoramento"
  | "monitoramento_finalizado";

export type TipoExame = 
  | "RNM"
  | "HOLTER"
  | "ECO"
  | "DTC"
  | "DOPPLER_CAROTIDAS"
  | "ECG"
  | "ECO_TRANS"
  | "LABS"
  | "OUTROS";

export interface Telefone {
  sistema: "phone";
  valor: string;
  uso: "mobile" | "home" | "work";
}

export interface HistoricoStatus {
  status: StatusMonitoramento;
  timestamp: Date;
}

export interface ExtensaoMonitoramento {
  dataCadastroSistema: Date;
  statusMonitoramento: StatusMonitoramento;
  motivoSemCriterio?: string;
  motivoFinalizacao?: string;
  historicoStatus: HistoricoStatus[];
}

export interface Paciente {
  _id?: string;
  resourceType: "Patient";
  identifier: {
    system: string;
    value: string; // Número do atendimento
  }[];
  name: {
    use: "official";
    text: string; // Nome em maiúsculas
  }[];
  gender: "female" | "male";
  birthDate: string; // YYYY-MM-DD
  telecom: Telefone[];
  address: {
    city: string;
  }[];
  _extension_Monitoramento: ExtensaoMonitoramento;
}

export interface Internacao {
  _id?: string;
  resourceType: "Encounter";
  status: "in-progress" | "finished";
  subject: string; // Referência ao Paciente
  period: {
    start: string;
    end?: string;
  };
  location?: {
    location: {
      display: string; // Setor
    };
    _location: {
      extension: {
        leito: string;
      };
    };
  }[];
  _extension_Monitoramento: {
    dataPrevistaAlta?: Date;
  };
}

export interface PedidoExame {
  _id?: string;
  resourceType: "ServiceRequest";
  subject: string; // Referência ao Paciente
  status: "active" | "completed";
  code: {
    coding: {
      system: string;
      code: TipoExame;
    }[];
  };
  note?: {
    text: string;
  }[];
  occurrenceDateTime: Date;
  _extension_Monitoramento: {
    dataRealizacao?: Date;
  };
}

export interface Agendamento {
  _id?: string;
  resourceType: "Appointment";
  subject: string; // Referência ao Paciente
  participant: {
    actor: {
      display: string; // Nome do profissional
    };
  }[];
  status: "proposed" | "booked" | "cancelled" | "noshow" | "fulfilled";
  start: Date;
  comment?: string;
}

export type DesfechoContato = 
  | "sucesso"
  | "caixa_postal"
  | "nao_atende"
  | "nao_responde"
  | "recusou";

export type MeioContato = "ligacao" | "whatsapp" | "presencial";

export interface RegistroContato {
  _id?: string;
  resourceType: "Communication";
  subject: string; // Referência ao Paciente
  sent: Date;
  medium: {
    coding: {
      code: MeioContato;
    }[];
  };
  _extension_Monitoramento: {
    desfecho: DesfechoContato;
  };
  payload: {
    contentString: string;
  }[];
}

export interface Metricas {
  totalPacientes: number;
  percentualSemCriterios: number;
  quantidadeExamesRealizados: number;
  quantidadeConsultasConfirmadas: number;
  contagemContatosRealizados: number;
  taxaConclusao: number;
}
