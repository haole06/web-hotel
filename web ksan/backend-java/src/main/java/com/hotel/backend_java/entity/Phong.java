package com.hotel.backend_java.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "phong")
public class Phong {

    @Id
    @Column(name = "PhongSo")
    @JsonProperty("PhongSo") // 🌟 Bùa nhận diện Số Phòng
    private String phongSo;

    @Column(name = "LoaiPhong")
    @JsonProperty("LoaiPhong") // 🌟 Bùa nhận diện Loại Phòng
    private String loaiPhong;

    @Column(name = "GiaPhong")
    @JsonProperty("GiaPhong") // 🌟 Bùa nhận diện Giá Phòng
    private Double giaPhong; // Đổi sang Double để an toàn với số tiền

    @Column(name = "TinhTrang")
    @JsonProperty("TinhTrang") // 🌟 Bùa nhận diện Tình Trạng
    private String tinhTrang;

    // ----- CÁC HÀM GETTER & SETTER BẮT BUỘC PHẢI CÓ -----
    public String getPhongSo() {
        return phongSo;
    }

    public void setPhongSo(String phongSo) {
        this.phongSo = phongSo;
    }

    public String getLoaiPhong() {
        return loaiPhong;
    }

    public void setLoaiPhong(String loaiPhong) {
        this.loaiPhong = loaiPhong;
    }

    public Double getGiaPhong() {
        return giaPhong;
    }

    public void setGiaPhong(Double giaPhong) {
        this.giaPhong = giaPhong;
    }

    public String getTinhTrang() {
        return tinhTrang;
    }

    public void setTinhTrang(String tinhTrang) {
        this.tinhTrang = tinhTrang;
    }
}