from datetime import datetime, timezone
from typing import Optional, Literal, Tuple
from pydantic import BaseModel, Field, field_validator


class ComandoExpedir(BaseModel):
    comando: Literal["ExpedirEncomenda"] = "ExpedirEncomenda"
    encomendaId: str = Field(..., description="Identificador da encomenda a expedir (ex: ENC-1042)")
    transportadora: str = Field(..., min_length=2, description="Nome da transportadora responsável (ex: RotaSul)")


class EncomendaExpedida(BaseModel):
    tipo: Literal["EncomendaExpedida"] = Field(
        default="EncomendaExpedida",
        description="Tipo do evento que identifica o contrato"
    )
    eventoId: str = Field(
        ...,
        min_length=3,
        description="Identificador único da mensagem (idempotência/deduplicação)"
    )
    encomendaId: str = Field(
        ...,
        min_length=3,
        description="Identificador da encomenda relacionada"
    )
    instante: datetime = Field(
        ...,
        description="Data e hora em que o evento ocorreu com timezone (ISO 8601)"
    )
    transportadora: str = Field(
        ...,
        min_length=2,
        description="Nome da transportadora encarregada do envio"
    )

    @field_validator("instante")
    @classmethod
    def validar_timezone(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    def to_event_dict(self) -> dict:
        iso_str = self.instante.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return {
            "tipo": self.tipo,
            "eventoId": self.eventoId,
            "encomendaId": self.encomendaId,
            "instante": iso_str,
            "transportadora": self.transportadora,
        }


class EstadoEncomenda(BaseModel):
    encomendaId: str = Field(..., description="Identificador da encomenda")
    estado: Literal["em preparação", "expedida", "entregue"] = Field(..., description="Estado atual da encomenda")
    transportadora: Optional[str] = Field(None, description="Nome da transportadora atribuída")
    ultimoEvento: Optional[EncomendaExpedida] = Field(None, description="Último evento emitido")
    atualizadoEm: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp da última atualização")


def validar_evento(data: dict) -> Tuple[bool, Optional[str], Optional[EncomendaExpedida]]:
    if not isinstance(data, dict):
        return False, "O payload tem de ser um objeto JSON válido.", None
    try:
        evento = EncomendaExpedida.model_validate(data)
        return True, None, evento
    except Exception as e:
        return False, str(e), None
