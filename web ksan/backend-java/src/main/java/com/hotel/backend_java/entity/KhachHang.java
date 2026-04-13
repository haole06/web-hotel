package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "khachhang") // 🌟 Đã sửa chuẩn tên bảng viết liền theo file Dump
public class KhachHang {

    @Id
    @Column(name = "MaKH")
    @JsonProperty("MaKH") // 🌟 Đã gắn lại bùa chống "nghẽn" dữ liệu
    private String maKH;

    @Column(name = "HoTen")
    @JsonProperty("HoTen")
    private String hoTen;

    @Column(name = "CMND")
    @JsonProperty("CMND")
    private String cmnd;

    @Column(name = "DienThoai")
    @JsonProperty("DienThoai")
    private String dienThoai;

    // ----- GETTER & SETTER -----
    public String getMaKH() {
        return maKH;
    }

    public void setMaKH(String maKH) {
        this.maKH = maKH;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getCmnd() {
        return cmnd;
    }

    public void setCmnd(String cmnd) {
        this.cmnd = cmnd;
    }

    public String getDienThoai() {
        return dienThoai;
    }

    public void setDienThoai(String dienThoai) {
        this.dienThoai = dienThoai;
    }
}