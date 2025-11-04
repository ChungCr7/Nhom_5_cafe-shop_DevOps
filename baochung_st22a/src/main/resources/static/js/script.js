$(function(){

	// User Register validation

	var $userRegister=$("#userRegister");

	$userRegister.validate({

		rules:{
			name:{
				required:true,
				lettersonly:true
			},
			email: {
				required: true,
				space: true,
				email: true
			},
			mobileNumber: {
				required: true,
				space: true,
				numericOnly: true,
				minlength: 10,
				maxlength: 12

			},
			password: {
				required: true,
				space: true

			},
			confirmpassword: {
				required: true,
				space: true,
				equalTo: '#pass'

			},
			address: {
				required: true,
				all: true

			},
			city: {
				required: true,
				all: true

			},
			state: {
				required: true,
				all: true
			},
			pincode: {
				required: true,
				space: true,
				numericOnly: true

			},
			img: {
				required: true,
			}

		},
		messages:{
			name:{
				required:'name required',
				lettersonly:'invalid name'
			},
			email: {
				required: 'email name must be required',
				space: 'space not allowed',
				email: 'Invalid email'
			},
			mobileNumber: {
				required: 'mob no must be required',
				space: 'space not allowed',
				numericOnly: 'invalid mob no',
				minlength: 'min 10 digit',
				maxlength: 'max 12 digit'
			},

			password: {
				required: 'password must be required',
				space: 'space not allowed'

			},
			confirmpassword: {
				required: 'confirm password must be required',
				space: 'space not allowed',
				equalTo: 'password mismatch'

			},
			address: {
				required: 'address must be required',
				all: 'invalid'

			},

			city: {
				required: 'city must be required',
				all: 'invalid'

			},
			state: {
				required: 'state must be required',
				all: 'invalid'

			},
			pincode: {
				required: 'pincode must be required',
				space: 'space not allowed',
				numericOnly: 'invalid pincode'

			},
			img: {
				required: 'image required',
			}
		}
	});


	// Orders Validation

	var $orders=$("#orders");

	$orders.validate({
		rules:{
			firstName:{
				required:true,
				lettersonly:true
			},
			lastName:{
				required:true,
				lettersonly:true
			},
			email: {
				required: true,
				space: true,
				email: true
			},
			mobileNo: {
				required: true,
				space: true,
				numericOnly: true,
				minlength: 10,
				maxlength: 12

			},
			address: {
				required: true,
				all: true

			},
			city: {
				required: true,
				all: true

			},
			state: {
				required: true,
				all: true
			},
			pincode: {
				required: true,
				space: true,
				numericOnly: true

			},
			paymentType:{
				required: true
			}
		},
		messages:{
			firstName:{
				required:'first required',
				lettersonly:'invalid name'
			},
			lastName:{
				required:'last name required',
				lettersonly:'invalid name'
			},
			email: {
				required: 'email name must be required',
				space: 'space not allowed',
				email: 'Invalid email'
			},
			mobileNo: {
				required: 'mob no must be required',
				space: 'space not allowed',
				numericOnly: 'invalid mob no',
				minlength: 'min 10 digit',
				maxlength: 'max 12 digit'
			},
			address: {
				required: 'address must be required',
				all: 'invalid'

			},
			city: {
				required: 'city must be required',
				all: 'invalid'

			},
			state: {
				required: 'state must be required',
				all: 'invalid'

			},
			pincode: {
				required: 'pincode must be required',
				space: 'space not allowed',
				numericOnly: 'invalid pincode'

			},
			paymentType:{
				required: 'select payment type'
			}
		}
	});

	// Reset Password Validation

	var $resetPassword=$("#resetPassword");

	$resetPassword.validate({

		rules:{
			password: {
				required: true,
				space: true

			},
			confirmPassword: {
				required: true,
				space: true,
				equalTo: '#pass'

			}
		},
		messages:{
			password: {
				required: 'password must be required',
				space: 'space not allowed'

			},
			confirmpassword: {
				required: 'confirm password must be required',
				space: 'space not allowed',
				equalTo: 'password mismatch'

			}
		}
	});

	// Custom Validation Methods

	jQuery.validator.addMethod('lettersonly', function(value, element) {
		return /^[\p{L}\s-]+$/u.test(value); // Cho phép các ký tự chữ cái từ mọi ngôn ngữ, bao gồm khoảng trắng và dấu gạch ngang
	});

	jQuery.validator.addMethod('space', function(value, element) {
		return /^[^-\s]+$/.test(value);
	});

	jQuery.validator.addMethod('all', function(value, element) {
		return /^[\p{L}\p{N}\s,._-]+$/u.test(value); // Cho phép chữ cái, số, khoảng trắng và dấu câu
	});

	jQuery.validator.addMethod('numericOnly', function(value, element) {
		return /^[0-9]+$/.test(value);
	});

});

$(function() {
	var swiper = new Swiper(".main-swiper", {
	  loop: true, // Cho phép lặp lại các slide
	  speed: 500, // Tốc độ chuyển slide
	  autoplay: {
		delay: 3000, // Thời gian chờ (3 giây) trước khi chuyển sang slide tiếp theo
		disableOnInteraction: false, // Tiếp tục autoplay ngay cả khi người dùng tương tác với slider
	  },
	  pagination: {
		el: ".swiper-pagination",
		clickable: true, // Cho phép nhấn vào các dấu chấm để chuyển slide
	  },
	  navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	  },
	});
  });

  document.addEventListener("DOMContentLoaded", function () {
    const swiper = new Swiper(".products-carousel.swiper", {
        slidesPerView: 4,
        spaceBetween: 20,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    // Cập nhật Swiper khi dữ liệu thay đổi
    const productContainer = document.querySelector(".swiper-wrapper");
    const observer = new MutationObserver(() => {
        swiper.update();
    });

    observer.observe(productContainer, { childList: true });
});



  

  

  