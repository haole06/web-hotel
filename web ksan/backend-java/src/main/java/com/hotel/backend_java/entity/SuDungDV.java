package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Table(name = "sudungdv")
public class SuDungDV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng (Auto Increment)
    @Column(name = "MaSD")
    @JsonProperty("MaSD")
    private Integer maSD;

    @Column(name = "PhongSo")
    @JsonProperty("PhongSo")
    private String phongSo;

    @Column(name = "MaDV")
    @JsonProperty("MaDV")
    private String maDV;

    @Column(name = "SoLuong")
    @JsonProperty("SoLuong")
    private Integer soLuong;

    @Column(name = "NgayNhan")
    @JsonProperty("NgayNhan")
    private LocalDate ngayNhan;

    @Column(name = "NgayTra")
    @JsonProperty("NgayTra")
    private LocalDate ngayTra;

    // ----- Các hàm Getter & Setter -----
    public Integer getMaSD() {
        return maSD;
    }

    public void setMaSD(Integer maSD) {
        this.maSD = maSD;
    }

    public String getPhongSo() {
        return phongSo;
    }

    public void setPhongSo(String phongSo) {
        this.phongSo = phongSo;
    }

    public String getMaDV() {
        return maDV;
    }

    public void setMaDV(String maDV) {
        this.maDV = maDV;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public LocalDate getNgayNhan() {
        return ngayNhan;
    }

    public void setNgayNhan(LocalDate ngayNhan) {
        this.ngayNhan = ngayNhan;
    }

    public LocalDate getNgayTra() {
        return ngayTra;
    }

    public void setNgayTra(LocalDate ngayTra) {
        this.ngayTra = ngayTra;
    }
}