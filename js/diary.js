const sendBtn = $("#send-btn");// diary 생성 버튼
const editPageBtn = $("#edit-page-btn");// diary 수정 페이지로 이동 버튼
const editBtn = $("#edit-btn");// diary 수정 버튼

async function setSendBtn() {
    sendBtn.css('display', '');
    editPageBtn.css('display', 'none');
    editBtn.css('display', 'none');
}

async function setEditPageBtn() {
    editPageBtn.css('display', '');
    sendBtn.css('display', 'none');
    editBtn.css('display', 'none');
}

async function setEditBtn() {
    editBtn.css('display', '');
    editPageBtn.css('display', 'none');
    sendBtn.css('display', 'none');
}

let firstName;
let userId = Cookies.get("user_id");
let diaryId;

// 쿼리스트링값 저장
const url = new URL(window.location.href);
const urlParams = url.searchParams;

// 하나의 diary에 접속했을 경우
if (urlParams.get('id') !== null) {
    console.log(urlParams.get("id"));
    diaryId = urlParams.get('id');
    turnOnLock();
    setEditPageBtn();
    getDiaryData();
    setDiaryDateFormat();
} else {
    turnOffLock();
    // 이미 답했다면 답한 diary를 불러오자
    $.ajax({
        type: 'get',           // 타입 (get, post, put 등등)
        url: `http://54.180.251.177:3000/diaries/${userId}`,           // 요청할 서버url
        async: true,            // 비동기화 여부 (default : true)
        dataType: 'json',       // 데이터 타입 (html, xml, json, text 등등)
        data: {},
        success: async function (result) { // 결과 성공 콜백함수
            let yourDate = String(today).substring(8, 10);
            console.log("today: " + today);
            // 오늘 날짜 포맷팅
            dateFormat = await getTodayDate(String(today), Number(yourDate));
            dateFormat = String(dateFormat).replace("undefined", String(today.getFullYear()));
            $('#header-date').text(dateFormat);
            if (result.length === 0) {// 가장 처음 작성하는 글이라면
                await setSendBtn();
                await setUserFirstName();
                await setTodayQuestion(yourDate);
            } else {
                let lastDiaryDate = result[result.length - 1].createdAt.substring(8, 10);
                // 오늘 일기 작성 전이라면
                console.log("lastDiaryDate: "+lastDiaryDate);
                console.log("yourDate: "+yourDate);
                if (lastDiaryDate !== yourDate) {
                    await setSendBtn();
                    await setUserFirstName();
                    await setTodayQuestion(yourDate);
                } else {// 오늘 일기를 작성한 뒤라면
                    await setEditPageBtn();
                    diaryId = result[result.length - 1].id;
                    await turnOnLock();
                    await getDiaryData();
                }
            }
        }
    });
}

async function setDiaryDateFormat() {
    let dateFormat;

    axios.get(`http://54.180.251.177:3000/diaries/${userId}/${diaryId}`)
        .then(async (result) => {
            console.log(result.data.quesId);
            dateFormat = await getTodayDate(result.data.createdAt, result.data.quesId);
            $('#header-date').text(dateFormat);

        }).catch((err) => {
            console.log("다이어리 createAt 출력 실패" + err);
        });
    console.log(dateFormat);
}

// user firtname 불러오기
$.support.cors = true;
async function setUserFirstName() {
    console.log("setUserFirstName()");
    $.ajax({
        type: 'get',           // 타입 (get, post, put 등등)
        url: `http://54.180.251.177:3000/users`,           // 요청할 서버url
        async: true,            // 비동기화 여부 (default : true)
        dataType: 'json',       // 데이터 타입 (html, xml, json, text 등등)
        data: {},
        success: async function (result) { // 결과 성공 콜백함수
            result.forEach((result) => {
                if (result.id == userId) {
                    $("#first-name").text(result.firstName);
                }
            });
        }
    });
}

// 오늘의 질문 가져오기
$.support.cors = true;
async function setTodayQuestion(id) {
    console.log("setTodayQuestion()");
    let quesId = id;
    $.ajax({
        type: 'get',           // 타입 (get, post, put 등등)
        url: `http://54.180.251.177:3000/questions/${quesId}`,           // 요청할 서버url
        async: true,            // 비동기화 여부 (default : true)
        dataType: 'json',       // 데이터 타입 (html, xml, json, text 등등)
        data: {},
        success: async function (question) { // 결과 성공 콜백함수
            $("#question").text(question);
        }
    });
}

// 즐겨찾기 클릭 이벤트
let isClicked = false;
async function isStarClicked(star = isClicked) {
    console.log("isStarClicked()");
    if (!star) {
        document.getElementsByClassName("important")[0].src = "./img/icon_filled_star_writing.svg";
        isClicked = true;
    } else {
        document.getElementsByClassName("important")[0].src = "./img/icon_star_writing.svg";
        isClicked = false;
    }
    console.log("star: " + star);
    console.log("isClicked: " + isClicked);
}

async function getSelfCheckScoreSum() {
    console.log("getSelfCheckScoreSum()");
    let sum = 0;
    sum += Number($(":input:radio[name=q1]:checked").val());
    sum += Number($(":input:radio[name=q2]:checked").val());
    sum += Number($(":input:radio[name=q3]:checked").val());
    sum += Number($(":input:radio[name=q4]:checked").val());
    return sum;
}

async function getStateImgSrc(score) {
    console.log("getStateImgSrc()");
    if (score >= 80) {
        return "./img/state_good.svg";
    } else if (score >= 46) {
        return "./img/state_normal.svg";
    } else {
        return "./img/state_bad.svg";
    }
}

// post new diary
async function createDiary() {
    console.log("createDiary()");
    await setSendBtn();
    // 비활성화 해제
    await turnOffLock();

    let answer = $("#answer").val();
    if (answer === '')
        answer = ' ';
    let sum = await getSelfCheckScoreSum();// 총합
    let imgSrc = await getStateImgSrc(sum);
    let state = false;
    if (imgSrc === "./img/state_good.svg")
        state = true;
    let star = isClicked;

    const req = {
        "answer": answer,
        "star": star,
        "score": sum,
        "state": state,
        "companyId": Cookies.get("company_id")
    }

    let quesId = Number(String(today).substring(8, 10));

    console.log("answer: " + answer);
    console.log("sum: " + sum);
    console.log("imgSrc: " + imgSrc);
    console.log("state: " + state);
    console.log("star: " + star);
    console.log("quesId: " + quesId);
    console.log("userId: " + userId);

    axios.post(`http://54.180.251.177:3000/diaries/${userId}/${quesId}`, req)
        .then(async (result) => {
            if (result.data.data.state) {
                await saveGoodCount(result.data.data.companyId);
            }
            let id = result.data.data.id;
            await saveSelfCheckValue(id);// self check test result 각각의 값 저장
            location.href = "../list.html";

        }).catch((err) => {
            console.log(err);
        });

}

async function saveSelfCheckValue(id) {
    console.log("saveSelfCheckValue()");
    diaryId = id;
    let req = {
        "st_answer1": Number($(":input:radio[name=q1]:checked").val()),
        "st_answer2": Number($(":input:radio[name=q2]:checked").val()),
        "st_answer3": Number($(":input:radio[name=q3]:checked").val()),
        "st_answer4": Number($(":input:radio[name=q4]:checked").val())
    };

    console.log("st_answer1: " + Number($(":input:radio[name=q1]:checked").val()));
    console.log("st_answer2: " + Number($(":input:radio[name=q2]:checked").val()));
    console.log("st_answer3: " + Number($(":input:radio[name=q3]:checked").val()));
    console.log("st_answer4: " + Number($(":input:radio[name=q4]:checked").val()));

    await axios.post(`http://54.180.251.177:3000/self-test-results/${diaryId}`, req)
        .then(async (result) => {
            console.log(result);
            //console.log("st_answer1: " + result.data.st_answer1);

        }).catch((err) => {
            console.log("self test result 값 저장 실패: " + err);
        })
}

async function updateSelfCheckValue(id) {
    console.log("updateSelfCheckValue()");
    diaryId = id;
    let req = {
        "diaryId": diaryId,
        "st_answer1": Number($(":input:radio[name=q1]:checked").val()),
        "st_answer2": Number($(":input:radio[name=q2]:checked").val()),
        "st_answer3": Number($(":input:radio[name=q3]:checked").val()),
        "st_answer4": Number($(":input:radio[name=q4]:checked").val())
    };

    console.log("st_answer1: " + Number($(":input:radio[name=q1]:checked").val()));
    console.log("st_answer2: " + Number($(":input:radio[name=q2]:checked").val()));
    console.log("st_answer3: " + Number($(":input:radio[name=q3]:checked").val()));
    console.log("st_answer4: " + Number($(":input:radio[name=q4]:checked").val()));

    $.support.cors = true;
    await axios.put(`http://54.180.251.177:3000/self-test-results/${diaryId}`, req)
        .then(async (result) => {
            console.log(result);
        }).catch((err) => {
            console.log("self test result 값 수정 실패: " + err);
        })
}

async function getSelfCheckValue(id) {
    console.log("getSelfCheckValue()");
    diaryId = id;
    axios.get(`http://54.180.251.177:3000/self-test-results/${diaryId}`)
        .then(async (result) => {
            await setSelfCheckValueHtml(result.data.st_answer1, "q1");
            await setSelfCheckValueHtml(result.data.st_answer2, "q2");
            await setSelfCheckValueHtml(result.data.st_answer3, "q3");
            await setSelfCheckValueHtml(result.data.st_answer4, "q4");
        }).catch((err) => {
            console.log(err);
        })
}

// 가져온 self-check 값 저장된 위치에 넣기
async function setSelfCheckValueHtml(value, name) {
    console.log("setSelfCheckValueHtml()");
    let question = document.getElementsByName(name);
    let index = question.length - (value / 5);
    //console.log(question[index].checked);
    question[index].checked = true;
}

async function saveGoodCount(companyId) {
    console.log("saveGoodCount()");
    let req = {};

    $.support.cors = true;
    axios.post(`http://54.180.251.177:3000/companies/${companyId}`, req)
        .then(async (result) => {
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
}

async function getDiaryData() {
    console.log("getDiaryData()");
    await setUserFirstName();
    axios.get(`http://54.180.251.177:3000/diaries/${userId}/${diaryId}`)
        .then(async (result) => {
            await setTodayQuestion(result.data.quesId);
            $("#answer").text(result.data.answer + " ");

            await getSelfCheckValue(result.data.id);
            await isStarClicked(!result.data.star);
        }).catch((err) => {
            console.log("문제 불러오기 실패" + err);
        });
}

// 비활성화
function turnOffLock() {
    console.log("turnOffLock(): 수정가능");
    $("#answer").attr("disabled", false);
    $('#answer').css('caret-color', '');
    $("#important").attr("disabled", false);
    $("input:radio[name=q1]").attr("disabled", false);
    $("input:radio[name=q2]").attr("disabled", false);
    $("input:radio[name=q3]").attr("disabled", false);
    $("input:radio[name=q4]").attr("disabled", false);
}

function turnOnLock() {
    console.log("turnOnLock(): 수정불가능");
    $("#answer").attr("disabled", true);
    $('#answer').css('caret-color', 'transparent');
    $("#important").attr("disabled", true);
    $("input:radio[name=q1]").attr("disabled", true);
    $("input:radio[name=q2]").attr("disabled", true);
    $("input:radio[name=q3]").attr("disabled", true);
    $("input:radio[name=q4]").attr("disabled", true);
}

async function goDiaryEditViewPage() {
    console.log("goDiaryEditViewPage(): 왔니?");
    await getDiaryData();
    let answer = $("#answer").val();
    if (answer === ' ')
        answer = '';
    await turnOffLock();
    await setEditBtn();
}

// 즐겨찾기 여부
async function getStarValue() {
    console.log("getStarValue()");
    let isStar;
    axios.get(`http://54.180.251.177:3000/diaries/${userId}/${diaryId}`)
        .then(async (result) => {
            isStar = result.data.star;
            console.log("isStar: " + isStar);
        }).catch((err) => {
            console.log("star값 불러오기 실패" + err);
        });

    if (isStar === 1)
        isClicked = true;
    else
        isClicked = false;

    await goDiaryEditViewPage();
}

async function getCompanyIdValue() {
    console.log("getCompanyIdValue()");
    let companyId;
    axios.get(`http://54.180.251.177:3000/diaries/${userId}/${diaryId}`)
        .then(async (result) => {
            companyId = result.data.companyId;
            console.log("companyId: " + companyId);
        }).catch((err) => {
            console.log("companyId값 불러오기 실패" + err);
        });

    return companyId;
}

async function updateDiary() {
    console.log("updateDiary()");
    let answer = $("#answer").val();
    if (answer === '')
        answer = ' ';
    let sum = await getSelfCheckScoreSum();// 총합
    let imgSrc = await getStateImgSrc(sum);
    let state = false;
    if (imgSrc === "./img/state_good.svg")
        state = true;
    let star = isClicked;
    let companyId = await getCompanyIdValue();
    let quesId = Number(String(today).substring(8, 10));

    const req = {
        "userId": userId,
        "quesId": quesId,
        "answer": answer,
        "star": star,
        "score": sum,
        "state": state,
        "companyId": companyId
    }
    console.log("answer: " + answer);
    console.log("star: " + star);
    console.log("score: " + sum);
    console.log("state: " + state);
    console.log("companyId: " + companyId);

    //location.href = "../list.html";

    $.support.cors = true;
    axios.put(`http://54.180.251.177:3000/diaries/${userId}/${diaryId}`, req)
        .then(async (result) => {
            if (state) {
                await saveGoodCount(companyId);
            }
            await updateSelfCheckValue(diaryId);// self check test result 각각의 값 저장
            console.log(result);
            location.href = `../diary.html?id=${diaryId}`;
        }).catch((err) => {
            console.log("수정되지 않음: " + err);
        });

}