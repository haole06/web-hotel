package com.hotel.backend_java.entity;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

// Lớp này không phải bảng, nó chỉ là "Khóa chính kép" cho bảng DatPhong
public class DatPhongId implements Serializable {
    private String phongSo;
    private LocalDate ngayDat;

    // ----- Bắt buộc phải có Constructor, equals và hashCode để Java so sánh khóa
    // -----
    public DatPhongId() {
    }

    public DatPhongId(String phongSo, LocalDate ngayDat) {
        this.phongSo = phongSo;
        this.ngayDat = ngayDat;
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        DatPhongId that = (DatPhongId) o;
        return Objects.equals(phongSo, that.phongSo) && Objects.equals(ngayDat, that.ngayDat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(phongSo, ngayDat);
    }
}