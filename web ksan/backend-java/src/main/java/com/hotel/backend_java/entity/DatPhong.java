package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Table(name = "datphong")
@IdClass(DatPhongId.class) // 🌟 Báo cho Java biết bảng này dùng khóa kép
public class DatPhong {

    @Id // Khóa 1
    @Column(name = "PhongSo")
    @JsonProperty("PhongSo")
    private String phongSo;

    @Id // Khóa 2
    @Column(name = "NgayDat")
    @JsonProperty("NgayDat")
    private LocalDate ngayDat;

    @Column(name = "MaKH")
    @JsonProperty("MaKH")
    private String maKH;

    @Column(name = "NgayNhan")
    @JsonProperty("NgayNhan")
    private LocalDate ngayNhan;

    @Column(name = "NgayTra")
    @JsonProperty("NgayTra")
    private LocalDate ngayTra;

    @Column(name = "SoNguoi")
    @JsonProperty("SoNguoi")
    private Integer soNguoi;

    @Column(name = "TinhTrang")
    @JsonProperty("TinhTrang")
    private String tinhTrang;

    // ----- Các hàm Getter & Setter -----
    public String getPhongSo() {
        return phongSo;
    }

    public void setPhongSo(String phongSo) {
        this.phongSo = phongSo;
    }

    public LocalDate getNgayDat() {
        return ngayDat;
    }

    public void setNgayDat(LocalDate ngayDat) {
        this.ngayDat = ngayDat;
    }

    public String getMaKH() {
        return maKH;
    }

    public void setMaKH(String maKH) {
        this.maKH = maKH;
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

    public Integer getSoNguoi() {
        return soNguoi;
    }

    public void setSoNguoi(Integer soNguoi) {
        this.soNguoi = soNguoi;
    }

    public String getTinhTrang() {
        return tinhTrang;
    }

    public void setTinhTrang(String tinhTrang) {
        this.tinhTrang = tinhTrang;
    }
}