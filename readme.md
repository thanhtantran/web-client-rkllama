
![Giới thiệu về RKLLAMA](https://github.com/user-attachments/assets/ef2b9b92-b816-4b78-a6b4-57abd0cedf94)

Chào mừng đến với RKLLAMA Web Client, một giao diện web nhẹ để tương tác với Máy chủ RKLLAMA, một công cụ cho phép chạy các mô hình ngôn ngữ trên các NPU Rockchip.


## Giới thiệu

RKLLAMA Web Client cung cấp một giao diện web thân thiện với người dùng cho rkllama, được tối ưu hóa cho phần cứng Rockchip. Lý tưởng cho các nhà phát triển làm việc với mô hình ngôn ngữ trên các NPU.

Note: *Bạn có thể chạy RKLLAMA Web Client cùng trên thiết bị Orange Pi với máy chủ RKLLAMA, tôi đã chỉnh sửa code để có thể chạy trên cùng một thiết bị mà vẫn truy cập được từ bên ngoài*

---



## Yêu cầu

- Orange Pi sử dụng RK3588 hoặc RK3588S, yêu cầu tối thiểu RAM 8GB (*chạy được các model tầm 3B đến 4B*) hoặc RAM 16GB (*chạy được các model đến 7B*).
- Máy chủ RKLLAMA đã được cài đặt và hoạt động (xem tại [https://github.com/thanhtantran/rkllama](https://github.com/thanhtantran/rkllama))
- Bạn sẽ cài trực tiếp Orange Pi đã cài RKLLAMA rồi truy cập từ máy PC bên ngoài
---

## Cài đặt RKLLAMA Web Client

1. Clone RKLLAMA Web Client:
   ```bash
   git clone https://github.com/thanhtantran/web-client-rkllama
   cd web-client-rkllama
   ./start.sh
   ```

![web-client-rkllama](https://github.com/user-attachments/assets/b7a9a116-b924-44a5-916c-18b64870cb56)

2. Truy cập vào RKLLAMA Web Client bằng trình duyệt từ máy tính tại http://IP:3000, chọn model

![web-client-rkllama-2](https://github.com/user-attachments/assets/aefd7eea-57d1-44c9-879c-2ce3c913d9d6)

3. Và bắt đầu chat bằng tiếng Việt luôn

![web-client-rkllama-3](https://github.com/user-attachments/assets/7f782f70-e0c6-4cde-ae87-572821615128)

4. Nếu không thích model này, ta có thể tải model khác (cấu trúc model vui lòng xem tại video [https://www.youtube.com/watch?v=tUsGf12h0ps](https://www.youtube.com/watch?v=tUsGf12h0ps)

![web-client-rkllama-4](https://github.com/user-attachments/assets/10e00cbf-d4e7-4dc1-afbd-70f7c9bd0db8)

## Mã nguồn gốc
Nếu bạn muốn chỉnh sửa thêm hoặc bổ sung, hãy clone mã nguồn gốc và fork trên đó
- https://github.com/NotPunchnox/web-client-rkllm

## Bản quyền
- Tuân theo bản quyền Apache2
