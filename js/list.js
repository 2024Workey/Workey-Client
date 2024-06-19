const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let today = new Date();// 현날짜
console.log("today: "+today);
let currentMonth = ('0' + (today.getMonth() + 1)).slice(-2);// 현재 달
let currentMonthIndex = Number(currentMonth) - 1;// 현재 달 인덱스
let currentMonthElement = $("#currentMonth");// 현재 달 세팅할 html
currentMonthElement.text(months[currentMonthIndex]);// 현재 달

// 월을 변경하는 함수
async function changeMonth() {

    currentMonthElement.text(months[currentMonthIndex]);
    await deleteList();
    await showDiaries();
    // 현재 월 표시 업데이트
    currentMonthElement.text(months[currentMonthIndex]);
}

// 이전 월로 이동하는 함수
async function previousMonth() {
    if (currentMonthIndex > 0) {
        currentMonthIndex--;
        await changeMonth();
    } else {
        currentMonthIndex = 12;
        await previousMonth();
    }
}

// 다음 월로 이동하는 함수
async function nextMonth() {
    if (currentMonthIndex < 11) {
        currentMonthIndex++;
        await changeMonth();
    } else {
        currentMonthIndex = -1;
        await nextMonth();
    }
}

function deleteList() {
    var div = $(".diary-box");
    for (let i = 0; i < div.length; i++) {
        div[i].remove();
    }
}

// async function getStateImgSrc(score) {
//     let imgSrc;
//     console.log(score);
//     if (score >= 80) {
//         imgSrc = "./img/state_good.svg";
//     } else if (score >= 46) {
//         imgSrc = "./img/state_normal.svg";
//     } else {
//         imgSrc = "./img/state_bad.svg";
//     }
//     return imgSrc;
// }

// 날짜 포맷 세팅
async function getMonthName(m) {
    let month = Number(m);
    return months[month % 12 - 1];
}

async function getDateFormat(d) {
    if (d === 1) return d + "st";
    else if (d === 2) return d + "nd";
    else if (d === 3) return d + "rd";
    else return d + "th";
}

async function setDiaryHtml(id, quesId, companyId, date, isStar, score) {
    try {
        $(".diary-list-box").append(await getDiaryHtml(id, quesId, companyId, date, isStar, score));// html - 덮어씌우기, append - 추가하기
    } catch (err) {
        console.log("getHtml함수 불러오기 실패");
    }
}

async function getDiaryHtml(id, quesId, companyId, date, isStar, score) {
    try {

        let starImg = '';
        const imgSrc = await getStateImgSrc(score);
        if (isStar) {
            starImg = `<img src="./img/icon_filled_star_list.svg" class="important" alt="즐겨찾기">`;
        }
        let question = await getQuestion(quesId);// 질문 가져오기
        let company = await getCompany(companyId);// 회사 가져오기

        let dateFormat = await getTodayDate(String(date), quesId);// 작성된 날짜 포맷 가져오기

        return `<div class="diary-box">
        ${starImg}
        <div class="text-box" onclick="location.href = '../diary.html?id=${id}';">
        <span class="title">${question}</span>
        <hr>
        <div class="bottom-box">
        <span class="company">${company}</span>
        <span class="date">${dateFormat}</span>
        </div>
        </div>
        <div class="img-box">
        <img src=${imgSrc} alt="">
        </div>
        </div>`;
    } catch (err) {
        console.log(err);
        console.log("다이어리 html 삽입 실패");
    }
}

// api
async function getQuestion(quesId) {
    let question = '';

    await axios.get(`http://54.180.251.177:3000/questions/${quesId}`)
        .then(async (result) => {
            question = result.data;
        }).catch((err) => {
            console.log("퀴즈 불러오기 실패");
        });
    return question;
}
// 회사 이름 가져오기
async function getCompany(companyId) {
    let company;
    await axios.get(`http://54.180.251.177:3000/companies/${companyId}`)
        .then(async (result) => {
            company = result.data.name;
        }).catch(async (err) => {
            console.log("회사 이름 가져오기 실패");
        });

    return company;
}

// 오늘 날짜 포맷 반환
async function getTodayDate(date, quesId) {
    console.log("date: "+date);
    let year = date.slice(0, 4);
    let month = date.slice(5, 7);
    let day = date.slice(8,10);
    month = await getMonthName(month);
    day = await getDateFormat(Number(quesId));
    return month + " " + day + ", " + year;
}

showDiaries();
async function showDiaries() {
    let userId = Cookies.get("user_id");
    await axios.get(`http://54.180.251.177:3000/diaries/${userId}`)
        .then(async (result) => {
            await result.data.forEach(async (element) => {
                // 작성된 달의 인덱스 구하기
                let index = Number(element.createdAt.substring(5, 7)) - 1;
                // 같은 달끼리만 보여주기
                //console.log("date: "+element.createdAt);
                if (months[index] === (months[currentMonthIndex])) {
                    await setDiaryHtml(element.id, element.quesId, element.companyId, element.createdAt, element.star, element.score);
                }
            });
        }).catch((err) => {
            console.log("다이어리 리스트 보여주기 실패");
        });
    return true;
}

// 검색
async function doKeyDown(event) {
    if (event.keyCode === 13 || event === 'onclick') {// enter키이거나 검색 버튼이 클릭됐다면
        let input = $("#searchText").val();
        console.log("input: "+input);
        if (input === '') {// 빈칸 검색이면 전체 다이어리 띄우기
            deleteDivList();
            await showDiaries();
        } else {
            deleteDivList();
            await findIncludedWord(input.toLowerCase());// 검색한 값에 따른 question 보기
        }
    }
}

// 해당 키워드가 포함되어있는지를 확인
async function findIncludedWord(input) {
    let userId = Cookies.get("user_id");
    input = String(input).replaceAll(" ", "");
    console.log("input1: "+input);

    await axios.get(`http://54.180.251.177:3000/diaries/${userId}`)
        .then(async (result) => {
            await result.data.forEach(async (element) => {
                let index = Number(element.createdAt.substring(5, 7)) - 1;
                let question = await getQuestion(element.quesId);
                question = question.toLowerCase().replaceAll(" ", "");// 소문자로 변경, 공백제거
                if (question.includes(input) && months[index] === (months[currentMonthIndex])) {// 월별로 필터링
                    await search(element.id);
                }
                return true;
            });
        }).catch((err) => {
            console.log("키워드 포함 여부 조회 실패");
        });
}

// 제목으로 검색하기
async function search(id) {
    let userId = Cookies.get("user_id");
    await axios.get(`http://54.180.251.177:3000/diaries/${userId}`)
        .then(async (result) => {
            await result.data.forEach(async (element) => {
                if (id === element.id) {
                    deleteDivList();
                    await setDiaryHtml(element.id, element.quesId, element.companyId, element.createdAt, element.star, element.score);
                }
            })

            return true;
        }).catch((err) => {
            console.log("검색된 제목을 가지고 있는 다이어리 불러오기 실패");
        });
}

// (검색) 다이어리 div 전체 지우기
function deleteDivList() {
    var div = $(".diary-box");
    for (let i = 0; i < div.length; i++) {
        if (div[i]) // div태그가 있는지 확인
            div[i].remove();
    }
}

// //
// let selectDate = document.getElementById("select-date");
// selectDate.addEventListener("change", showDiaryByDate());

// async function showDiaryByDate() {
//     const selectedDate = selectDate.value;
//     console.log(selectDate)

//     await axios.get(`http://54.180.251.177/diaries/date/detail?date=${selectedDate}`)
//         .then(async (result) => {
//             await setDiaryHtml(result.id, result.quesId, result.companyId, result.createdAt, result.star);
//     }).catch((err) => {
//         console.log("err : " + err)
//         console.log("해당 날짜의 다이어리 불러오기 실패")
//     })

// }