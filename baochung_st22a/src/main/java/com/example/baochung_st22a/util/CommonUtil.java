package com.example.baochung_st22a.util;

import java.io.UnsupportedEncodingException;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.example.baochung_st22a.model.ProductOrder;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.service.UserService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class CommonUtil {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserService userService;

    // 🔐 Gửi mail reset mật khẩu
    public Boolean sendMail(String url, String recipientEmail)
            throws UnsupportedEncodingException, MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("daspabitra55@gmail.com", "Shopping Cart");
        helper.setTo(recipientEmail);

        String content = "<p>Xin chào,</p>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>"
                + "<p>Nhấp vào liên kết bên dưới để thay đổi mật khẩu của bạn:</p>"
                + "<p><a href=\"" + url + "\">Đổi mật khẩu của tôi</a></p>";

        helper.setSubject("Đặt lại mật khẩu");
        helper.setText(content, true);
        mailSender.send(message);
        return true;
    }

    public static String generateUrl(HttpServletRequest request) {
        String siteUrl = request.getRequestURL().toString();
        return siteUrl.replace(request.getServletPath(), "");
    }

    // 🔔 Gửi mail khi đặt hàng hoặc cập nhật trạng thái đơn
    public Boolean sendMailForProductOrder(ProductOrder order, String status) throws Exception {

        String msg = "<p>Xin chào [[name]],</p>"
                + "<p>Cảm ơn bạn đã đặt hàng. Tình trạng đơn hàng hiện tại: <b>[[orderStatus]]</b>.</p>"
                + "<p><b>Thông tin sản phẩm:</b></p>"
                + "<p>Tên sản phẩm: [[productName]]</p>"
                + "<p>Danh mục: [[category]]</p>"
                + "<p>Số lượng: [[quantity]]</p>"
                + "<p>Giá: [[price]] đ</p>"
                + "<p>Hình thức thanh toán: [[paymentType]]</p>"
                + "<br><p>Trân trọng,</p><p><b>Đội ngũ Fast Deal Coffee</b></p>";

        // ✅ Tạo email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("daspabitra55@gmail.com", "Coffee Shop System");
        helper.setTo(order.getOrderAddress().getEmail());

        // ✅ Thay thế dữ liệu thực tế
        msg = msg.replace("[[name]]", order.getOrderAddress().getFirstName());
        msg = msg.replace("[[orderStatus]]", status);
        msg = msg.replace("[[productName]]", order.getProduct().getTitle());
        msg = msg.replace("[[category]]", order.getProduct().getCategory());
        msg = msg.replace("[[quantity]]", order.getQuantity().toString());

        // ✅ Lấy giá từ order (có thể null → fallback về giá trung bình)
        double price = order.getPrice() != null
                ? order.getPrice()
                : (order.getProduct().getDiscountPriceMedium() != null
                        ? order.getProduct().getDiscountPriceMedium()
                        : order.getProduct().getPriceMedium());

        msg = msg.replace("[[price]]", String.format("%.0f", price));
        msg = msg.replace("[[paymentType]]", order.getPaymentType());

        helper.setSubject("Cập nhật đơn hàng #" + order.getOrderId());
        helper.setText(msg, true);

        mailSender.send(message);
        return true;
    }

    // 🧩 Lấy thông tin user hiện tại
    public UserDtls getLoggedInUserDetails(Principal p) {
        String email = p.getName();
        return userService.getUserByEmail(email);
    }
}
