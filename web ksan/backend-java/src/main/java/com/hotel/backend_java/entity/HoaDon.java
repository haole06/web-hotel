package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Table(name = "hoadon")
public class HoaDon {

    @Id
    @Column(name = "MaHD")
    @JsonProperty("MaHD")
    private String maHD;

    @Column(name = "PhongSo")
    @JsonProperty("PhongSo")
    private String phongSo;

    @Column(name = "NgayNhan")
    @JsonProperty("NgayNhan")
    private LocalDate ngayNhan;

    @Column(name = "NgayTra")
    @JsonProperty("NgayTra")
    private LocalDate ngayTra;

    @Column(name = "PhuongThucTT")
    @JsonProperty("PhuongThucTT")
    private String phuongThucTT;

    @Column(name = "TongDV")
    @JsonProperty("TongDV")
    private Double tongDV;

    @Column(name = "TongTien")
    @JsonProperty("TongTien")
    private Double tongTien;

    // ----- Getter & Setter -----
    public String getMaHD() {
        return maHD;
    }

    public void setMaHD(String maHD) {
        this.maHD = maHD;
    }

    public String getPhongSo() {
        return phongSo;
    }

    public void setPhongSo(String phongSo) {
        this.phongSo = phongSo;
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

    public String getPhuongThucTT() {
        return phuongThucTT;
    }

    public void setPhuongThucTT(String phuongThucTT) {
        this.phuongThucTT = phuongThucTT;
    }

    public Double getTongDV() {
        return tongDV;
    }

    public void setTongDV(Double tongDV) {
        this.tongDV = tongDV;
    }

    public Double getTongTien() {
        return tongTien;
    }

    public void setTongTien(Double tongTien) {
        this.tongTien = tongTien;
    }
}