/* API 연동 */
function login() {
  let email = $("#email").val();
  let pw = $("#password").val();

  const req = {
    "email": email,
    "password": pw
  }

  axios.post(`http://54.180.251.177:3000/users/login`, req)
    .then((result) => {
      Cookies.set("user_id", result.data.id);
      Cookies.set("company_id", result.data.company);
      // Cookies.get("user_id")
      location.href = "../index.html";
    }).catch((err) => {

    });

  // $.support.cors = true;
  // $.ajax({
  //   type: 'post',           // 타입 (get, post, put 등등)
  //   url: 'https://54.180.251.106/users/login',           // 요청할 서버url
  //   async: true,            // 비동기화 여부 (default : true)
  //   dataType: 'json',       // 데이터 타입 (html, xml, json, text 등등)
  //   data: JSON.stringify(req),
  //   success: function (result) { // 결과 성공 콜백함수
  //     console.log(result);
  //     Cookies.set("user_id", result.data.id);
  //     // Cookies.get("user_id")
  //     location.href = "../index.html";
  //   }
  // });
}

/* 프론트 */
const pw = document.getElementById('password');
const visibleIcon = document.querySelector('.visible-btn')

// 비번 보이기 안보이기
function passwordVisible() {
  pw.classList.toggle('active');
  console.log(visibleIcon);

  if (pw.classList.contains('active')) {
    visibleIcon.style.backgroundImage = 'url("../img/icon_visible.svg")';
    pw.type = "text";
  } else {
    visibleIcon.style.backgroundImage = 'url("../img/icon_invisible.svg")';
    pw.type = "password";
  }
}

// 비번 보이기 버튼
function writePw(value) {
  if (value.trim() !== '') {
    visibleIcon.style.display = 'block';
  } else {
    visibleIcon.style.display = 'none';
  }
}