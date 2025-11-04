package com.example.baochung_st22a.service.impl;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.repository.UserRepository;
import com.example.baochung_st22a.service.UserService;
import com.example.baochung_st22a.util.AppConstant;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public UserDtls saveUser(UserDtls user) {
		user.setRole("ROLE_USER");
		user.setIsEnable(true);
		user.setAccountNonLocked(true);
		user.setFailedAttempt(0);

		String encodePassword = passwordEncoder.encode(user.getPassword());
		user.setPassword(encodePassword);
		return userRepository.save(user);
	}

	@Override
	public UserDtls getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Override
	public List<UserDtls> getUsers(String role) {
		return userRepository.findByRole(role);
	}

	@Override
	public Boolean updateAccountStatus(Integer id, Boolean status) {
		Optional<UserDtls> findByUser = userRepository.findById(id);
		if (findByUser.isPresent()) {
			UserDtls userDtls = findByUser.get();
			userDtls.setIsEnable(status);
			userRepository.save(userDtls);
			return true;
		}
		return false;
	}

	@Override
	public void increaseFailedAttempt(UserDtls user) {
		int attempt = user.getFailedAttempt() + 1;
		user.setFailedAttempt(attempt);
		userRepository.save(user);
	}

	@Override
	public void userAccountLock(UserDtls user) {
		user.setAccountNonLocked(false);
		user.setLockTime(new Date());
		userRepository.save(user);
	}

	@Override
	public boolean unlockAccountTimeExpired(UserDtls user) {
		long lockTime = user.getLockTime().getTime();
		long unlockTime = lockTime + AppConstant.UNLOCK_DURATION_TIME;
		long currentTime = System.currentTimeMillis();

		if (unlockTime < currentTime) {
			user.setAccountNonLocked(true);
			user.setFailedAttempt(0);
			user.setLockTime(null);
			userRepository.save(user);
			return true;
		}
		return false;
	}

	@Override
	public void resetAttempt(int userId) {
		// (Tùy chọn) Bạn có thể reset số lần đăng nhập sai nếu cần
	}

	@Override
	public void updateUserResetToken(String email, String resetToken) {
		UserDtls findByEmail = userRepository.findByEmail(email);
		findByEmail.setResetToken(resetToken);
		userRepository.save(findByEmail);
	}

	@Override
	public UserDtls getUserByToken(String token) {
		return userRepository.findByResetToken(token);
	}

	@Override
	public UserDtls updateUser(UserDtls user) {
		return userRepository.save(user);
	}

	@Override
public UserDtls updateUserProfile(UserDtls user, MultipartFile img) {
    UserDtls dbUser = userRepository.findById(user.getId()).orElse(null);

    if (dbUser == null) {
        return null;
    }

    try {
        // ✅ Chỉ xử lý khi có upload ảnh
        if (img != null && !img.isEmpty()) {
            // 🟢 Đường dẫn thực tế tới thư mục lưu ảnh (ngang cấp với project)
            String uploadDir = "uploads/profile_img/";
            Path uploadPath = Paths.get(uploadDir);

            // Tạo thư mục nếu chưa tồn tại
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 🧩 Tạo tên file duy nhất để tránh ghi đè
            String fileName = System.currentTimeMillis() + "_" + img.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // 🧩 Lưu file thật vào ổ đĩa
            Files.copy(img.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Cập nhật tên file vào database
            dbUser.setProfileImage(fileName);
        }

        // ✅ Cập nhật các trường thông tin khác
        dbUser.setName(user.getName());
        dbUser.setMobileNumber(user.getMobileNumber());
        dbUser.setAddress(user.getAddress());
        dbUser.setCity(user.getCity());
        dbUser.setState(user.getState());
        dbUser.setPincode(user.getPincode());

        // ✅ Lưu lại
        return userRepository.save(dbUser);

    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("❌ Lỗi khi lưu ảnh đại diện: " + e.getMessage());
    }
}

	@Override
	public UserDtls saveAdmin(UserDtls user) {
		user.setRole("ROLE_ADMIN");
		user.setIsEnable(true);
		user.setAccountNonLocked(true);
		user.setFailedAttempt(0);

		String encodePassword = passwordEncoder.encode(user.getPassword());
		user.setPassword(encodePassword);
		return userRepository.save(user);
	}

	@Override
	public Boolean existsEmail(String email) {
		return userRepository.existsByEmail(email);
	}

	// ✅ Thêm hàm mới để fix lỗi build (thống kê số lượng người dùng)
	@Override
	public long countUsers() {
		return userRepository.count();
	}
	
}
