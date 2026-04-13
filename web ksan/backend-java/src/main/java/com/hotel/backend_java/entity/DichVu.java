package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "dichvu")
public class DichVu {

    @Id
    @Column(name = "MaDV")
    @JsonProperty("MaDV")
    private String maDV;

    @Column(name = "TenDV")
    @JsonProperty("TenDV")
    private String tenDV;

    @Column(name = "GiaDV")
    @JsonProperty("GiaDV")
    private Integer giaDV;

    // ----- Tính Đóng Gói (Getter & Setter) -----
    public String getMaDV() {
        return maDV;
    }

    public void setMaDV(String maDV) {
        this.maDV = maDV;
    }

    public String getTenDV() {
        return tenDV;
    }

    public void setTenDV(String tenDV) {
        this.tenDV = tenDV;
    }

    public Integer getGiaDV() {
        return giaDV;
    }

    public void setGiaDV(Integer giaDV) {
        this.giaDV = giaDV;
    }
}