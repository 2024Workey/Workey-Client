function createDropdown() {
  var newDiv = document.createElement('div');
  newDiv.classList.add('dropdown');
  // newDiv.style.height = '17%';

  var scoreBox = document.createElement('div');
  scoreBox.classList.add('score-box');

  var img = document.createElement('img');
  img.src = './img/state_good.svg';
  img.alt = '이미지 설명';

  var br = document.createElement('br');

  var span = document.createElement('span');
  span.classList.add('number');
  span.textContent = '3,500';

  // score-box에 img, br, span을 추가합니다.
  scoreBox.appendChild(img);
  scoreBox.appendChild(br);
  scoreBox.appendChild(span);

  // dropdown에 score-box를 추가합니다.
  newDiv.appendChild(scoreBox);

  return newDiv;
}

// 드롭다운 이벤트
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function slide(dropdown) {
  // if (subToggle) {
    for (let i = 13; i < 17; i++) {
      dropdown.style.height = `${i}%`;
      await sleep(1);
    }
}

const rank = document.getElementsByClassName('rank-box');

function showDropdown(button) {
  const dropdown = document.getElementsByClassName('dropdown');
  Array.from(rank).forEach(function (e, i) {
    if (e === button) {
      Array.from(dropdown)[i].style.display = 'block';
      slide(Array.from(dropdown)[i]);
      // Array.from(dropdown)[i].style.transitionTimingFunction = 'ease-out';

    } else {
      Array.from(dropdown)[i].style.display = '';
    }
  });
}

getRanking()

function getRanking() {
  const company_id = Cookies.get('company_id');

  axios.get(`http://54.180.251.177:3000/companies`)
  .then((result) => {
    console.log(result.data);

    const dataArray = result.data;

    // 받아온 데이터를 처리하고 화면에 추가
    for (var i = 0; i < dataArray.length; i++) {
      console.log(dataArray[0].name);
      // 새로운 버튼과 드롭다운 영역을 생성
      var button = document.createElement('button');
      button.className = 'rank-box';
      button.onclick = function () {
        showDropdown(this);
      };

      var dropdown = document.createElement('div');
      dropdown.className = 'dropdown';

      // 버튼 내부의 HTML 구조를 설정
      button.innerHTML = `
        <div class="company-info-box">
            <span class="rank">${i + 1}</span>
            <img src="./img/company/${dataArray[i].image}" class="company-img" alt="">
            <span class="company-name">${dataArray[i].name}</span>
        </div>
      `;

      // 첫 세 개의 요소에만 top-box 추가
      if (i < 3) {
        button.innerHTML += `
          <div class="top-box">
              <img src="./img/icon_crown.svg" class="top3" alt="top 3">
          </div>`;
      }

      // 드롭다운 내부의 HTML 구조를 설정
      dropdown.innerHTML = `
        <div class="score-box">
            <img src="./img/state_good.svg" alt="이미지 설명"><br>
            <span class="number">${dataArray[i].total_good_state_count}</span>
        </div>
      `;

      // 버튼과 드롭다운을 화면에 추가
      document.getElementById('ranking-list-box').appendChild(button);
      document.getElementById('ranking-list-box').appendChild(dropdown);
    }

  }).catch((err) => {
    console.error(err)
  });
}