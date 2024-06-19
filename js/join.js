const checkIcons = [...document.getElementsByClassName('check-icon')];
const divInput = [...document.getElementsByClassName('div-input')];

const warningIcon = document.getElementById('warning-icon')
const warningMessage = document.getElementById('warning-message')

let companyLength = 8;

document.addEventListener('DOMContentLoaded', function () {
  getCompaniesList();
});

// First Name, Last Name, Password
function writeData(value, index) {
  if (value.trim() !== '') {
    checkIcons[index].style.display = 'block';
    divInput[index].style.borderBottom = '1px solid #9F57FB';
  } else {
    checkIcons[index].style.display = 'none';
    divInput[index].style.borderBottom = '1px solid #868686';
  }
}

// Email
function checkEmail(value) {
  if (value.trim() !== '') {
    var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if (!reg_email.test(value)) {
      // 이메일 형식이 아닐 때
      warningIcon.style.display = 'block';
      warningMessage.style.display = 'block';
      checkIcons[2].style.display = 'none';
      divInput[2].style.borderBottom = '1px solid #C36C64';
    } else {
      // 이메일 형식이 맞을 때
      warningIcon.style.display = 'none';
      warningMessage.style.display = 'none';
      checkIcons[2].style.display = 'block';
      divInput[2].style.borderBottom = '1px solid #9F57FB';
    }
  } else {
    // 아무것도 적히지 않았을 때
    warningIcon.style.display = 'none';
    warningMessage.style.display = 'none';
    checkIcons[2].style.display = 'none';
    divInput[2].style.borderBottom = '1px solid #868686';
  }
}

// Check Password
function checkPassword(value) {
  const password = document.getElementById('password');
  if (value === password.value) {
    checkIcons[4].style.display = 'block';
    divInput[4].style.borderBottom = '1px solid #9F57FB';
  } else {
    checkIcons[4].style.display = 'none';
    divInput[4].style.borderBottom = '1px solid #868686';
  }
}

// other 나라 input 나타내기
function changeCompanySelect(item) {
  const otherInput = document.getElementById('otherInput');

  otherInput.style.display = (item === 'Others') ? 'block' : 'none';

}

// SELECT 커스텀
const labels = document.querySelectorAll('.label'); // 0 = company, 1 = payday
const options = document.querySelectorAll('.optionItem');
// 클릭한 옵션의 텍스트를 라벨 안에 넣음
const handleSelect = function (item, i) {
  console.log("i: " + i);
  console.log("labels length: " + labels.length);
  console.log("company length: " + companyLength);
  labels.forEach(function (label) {
    console.log("item.textContent: " + Number(item.textContent) + 0);
    if (Number(item.textContent) + 0 == item.textContent) {
      labels[1].innerHTML = item.textContent;
    } else {
      labels[0].innerHTML = item.textContent;
      changeCompanySelect(item.textContent);
    }
    label.parentNode.classList.remove('active');
  })
}

// 옵션 클릭시 클릭한 옵션을 넘김
for (let i = 0; i < options.length; i++) {
  console.log("options length: " + options.length);
  options[i].addEventListener('click', function () {
    handleSelect(options[i], i);
  });
}

labels.forEach(function (label) {
  label.addEventListener('click', function () {
    if (label.parentNode.classList.contains('active')) {
      label.parentNode.classList.remove('active');
    } else {
      label.parentNode.classList.add('active');
    }
  });
})

async function signUp() {
  let firstName = $('#firstName').val();
  let lastName = $('#lastName').val();
  let email = $('#email').val();
  let password = $('#password').val();
  let checkPassword = $('#check-password').val();
  let companyId;
  let company = $('#company').text();
  let newCompanyName = $('#otherInput').val();
  let startTime = $('#startTime').val();
  let endTime = $('#endTime').val();
  let payday = $('#payday').text();

  if (company !== 'Others') {
    console.log("company가 Others가 아닙니다. ");
    try {
      await axios.get(`http://54.180.251.177:3000/companies/name/${company}`)
        .then((result) => {
          companyId = result.data.id;
          console.log(companyId);
        }).catch((err) => {
          console.log(err)
        });
    } catch (err) {
      console.err(err);
      return; // 에러 발생 시 회원가입을 진행하지 않음
    }
  } else {
    companyId = companyLength+1;
  }

  // 공백 확인
  if (firstName === '' ||
    lastName === '' ||
    email === '' ||
    password === '' ||
    checkPassword === '' ||
    startTime === '' ||
    endTime === '' ||
    ( company === 'Others' && newCompanyName.trim() === '')
  ) {
    console.log("입력 필요한 것 있음");
  } else {
    console.log("입력은 다 됨");
    let param = {
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "password": password,
      "startTime": `${startTime}:00`,
      "endTime": `${endTime}:00`,
      "company": companyId,
      "payday": payday,
      "picture": '../img/img.jpg',
      "goodStateCount": 0
    };

    $.support.cors = true;

    await axios.post(`http://54.180.251.177:3000/users/join`, param, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async function () {
      if (company === 'Others') {
        try {
          const result = await axios.post(`http://54.180.251.177:3000/companies`, {
            "name": newCompanyName,
            "image": "basic-img.svg",
            "total_good_state_count": 0
          });
          companyId = result.data.id;

        } catch (err) {
          console.error(err);
          return; // 에러 발생 시 회원가입을 진행하지 않음
        }
      }
      console.log("회원가입 성공");
      location.href = './join_completed.html';
    }).catch(function (error) {
      console.error("회원가입 실패:", error);
    });
  }
}

function getCompaniesList() {
  // 회사 list 가져오기 => 회사 dropdown
  axios.get(`http://54.180.251.177:3000/companies`)
    .then((result) => {
      const optionList = document.getElementById('company-list');
      const data = result.data;
      companyLength = data.length;
      // 데이터 순회하면서 각 항목에 대한 <li> 엘리먼트 생성 및 추가
      data.forEach((item, i) => {
        console.log("company get api: " + item.id);
        // 새로운 <li> 엘리먼트 생성
        const listItem = document.createElement('li');
        listItem.className = 'optionItem';
        listItem.textContent = item.name; // 받아온 데이터의 필드를 사용하거나 조정
        listItem.addEventListener('click', function () {
          handleSelect(listItem, i); // 적절한 i 값을 전달해야 합니다
        });
        // 생성한 <li> 엘리먼트를 목록에 추가
        optionList.appendChild(listItem);
      });
      const listItem = document.createElement('li');
      listItem.className = 'optionItem';
      listItem.textContent = 'Others';
      listItem.addEventListener('click', function () {
        handleSelect(listItem, companyLength); // 적절한 i 값을 전달해야 합니다
      });
      optionList.appendChild(listItem);
    }).catch((err) => {
      console.error(err)
    });
}