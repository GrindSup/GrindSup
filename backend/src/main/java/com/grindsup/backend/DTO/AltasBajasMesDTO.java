package com.grindsup.backend.DTO;

public class AltasBajasMesDTO {
    private String month;   // "2025-10"
    private Long altas;     // puede venir null y lo tratamos como 0
    private Long bajas;     // idem

    public AltasBajasMesDTO() {}
    public AltasBajasMesDTO(String month, Long altas, Long bajas) {
        this.month = month;
        this.altas = altas;
        this.bajas = bajas;
    }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Long getAltas() { return altas; }
    public void setAltas(Long altas) { this.altas = altas; }
    public Long getBajas() { return bajas; }
    public void setBajas(Long bajas) { this.bajas = bajas; }
}
