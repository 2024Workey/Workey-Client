// 드롭다운 이벤트
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function slide(dropdown) {
    for (let i = 470; i < 500; i++) {
        dropdown.style.height = `${i}px`;
        await sleep(1);
    }
}

const dropdown = document.getElementsByClassName('dropdown');
let count = 0;

function showDropdown() {
    if (count % 2 == 0) {
        count++;
        dropdown[0].style.display = 'block';
        slide(dropdown[0]);
    } else {
        count++;
        dropdown[0].style.display = '';
    }
}

// other 나라 input 나타내기
function changeCompanySelect(item) {
    const otherInput = document.getElementById('otherInput');

    otherInput.style.display = (item === 'Others') ? 'block' : 'none';

}

let startTime;
let endTime;

const spanFirstName = document.getElementById('first-name');
const spanLastName = document.getElementById('last-name');

const inputStartTime = document.getElementById('input-start-time');
const inputEndTime = document.getElementById('input-end-time');

const dropCompany = document.getElementById('drop-company-name');
const dropPayday = document.getElementById('drop-payday');

const spanCompanyName = document.getElementById('company-name');


document.addEventListener('DOMContentLoaded', () => {
    const user_id = Cookies.get('user_id');
    const company_id = Cookies.get('company_id');

    axios.get(`http://54.180.251.177:3000/users/mypage/${user_id}`)
        .then((result) => {
            console.log(result.data);
            const firstName = result.data.firstName;
            const lastName = result.data.lastName;
            const company = result.data.company;
            startTime = result.data.startTime;
            endTime = result.data.endTime;

            console.log("firstName: "+firstName);
            console.log("lastName: "+lastName);
            console.log("company: "+company);
            console.log("startTime: "+startTime);
            console.log("endTime: "+endTime);

            // 이름
            spanFirstName.innerHTML = firstName;
            spanLastName.innerHTML = lastName;

            // 일 시작, 끝 시간
            inputStartTime.value = startTime;
            inputEndTime.value = endTime;

            let index = 8;// payday의 인덱스
            let payday = result.data.payday;
            dropPayday.innerHTML = payday;

            // 회사 가져오기 => 회사 이름
            axios.get(`http://54.180.251.177:3000/companies/${company}`)
                .then((result) => {
                    let companyName;

                    companyName = result.data.name
                    console.log(companyName)
                    spanCompanyName.innerHTML = companyName;
                    dropCompany.innerHTML = companyName;

                }).catch((err) => {
                    console.error(err)
                });

        }).catch((err) => {
            console.error(err)
        });

    // 글 목록 가져오기 => 글 개수
    axios.get(`http://54.180.251.177:3000/diaries/${user_id}`)
        .then((result) => {
            const spanRecordCount = document.getElementById('record-count');
            spanRecordCount.innerHTML = result.data.length;

        }).catch((err) => {
            console.error(err)
        });

    // 회사 list 가져오기 => 회사 dropdown
    axios.get(`http://54.180.251.177:3000/companies/`)
        .then((result) => {
            const optionList = document.getElementById('option-list');
            const data = result.data;
            console.log(result.data);

            // 데이터 순회하면서 각 항목에 대한 <li> 엘리먼트 생성 및 추가
            data.forEach(item => {
                // 새로운 <li> 엘리먼트 생성
                const listItem = document.createElement('li');
                listItem.className = 'optionItem';
                listItem.textContent = item.name; // 받아온 데이터의 필드를 사용하거나 조정

                // 생성한 <li> 엘리먼트를 목록에 추가
                optionList.appendChild(listItem);
            });

            // SELECT 커스텀
            const labels = document.querySelectorAll('.label'); // 0 = company, 1 = payday

            const options = document.querySelectorAll('.optionItem');
            // 클릭한 옵션의 텍스트를 라벨 안에 넣음
            const handleSelect = function (item, i) {
                labels.forEach(function (label) {
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
                options[i].addEventListener('click', function () {
                    handleSelect(options[i], i);
                });
            }

            const paydayBox = document.getElementById('payday-box');

            labels.forEach(function (label) {
                label.addEventListener('click', function () {
                    if (label.parentNode.classList.contains('active')) {
                        label.parentNode.classList.remove('active');
                    } else {
                        label.parentNode.classList.add('active');
                        // paydayBox.style.marginTop = '250px';
                        // paydayBox.parentNode.style.height = "1000px";
                    }
                });
            })

        }).catch((err) => {
            console.error(err)
        });
})

function editMemberInfo() {
    const user_id = Cookies.get('user_id');
    const company_id = Cookies.get('company_id');

    let companyId;

    // 회사 list 가져오기 => 회사 dropdown
    axios.get(`http://54.180.251.177:3000/companies`)
        .then((result) => {
            const optionList = document.getElementById('option-list');
            const data = result.data;
            console.log("company get api: " + result.data);

            // 데이터 순회하면서 각 항목에 대한 <li> 엘리먼트 생성 및 추가
            data.forEach(item => {
                // 새로운 <li> 엘리먼트 생성
                const listItem = document.createElement('li');
                listItem.className = 'optionItem';
                listItem.textContent = item.name; // 받아온 데이터의 필드를 사용하거나 조정

                // 생성한 <li> 엘리먼트를 목록에 추가
                optionList.appendChild(listItem);

                if (item.name == dropCompany.innerHTML) {
                    companyId = item.id;
                    console.log(companyId)
                }
            });
            console.log(dropPayday.innerHTML);

            console.log("들어갑니당");
            let firstName, lastName, email, password, picture;
            let goodStateCount;
            // 기존 user 정보 가져오기
            $.support.cors = true;
            axios.get(`http://54.180.251.177:3000/users`)
                .then(async (result) => {
                    console.log("result"+result.data);
                    const data = result.data;
                    data.forEach(item => {
                        console.log("item: "+item.id);
                        if ( item.id === user_id ) {
                            fisrtName = item.firstName;
                            lastName = item.lastName;
                            email = item.email;
                            password = item.password;
                            picture = item.picture;
                            goodStateCount = item.goodStateCount;
                        }
                    });
                }).catch((err) => {
                    console.error("회원 정보 불러오기에 실패했습니다.: "+err);
                });

            let req = {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "password": password,
                "startTime": inputStartTime.value,
                "endTime": inputEndTime.value,
                "company": companyId,
                "picture": picture,
                "goodStateCount": goodStateCount,
                "payday": dropPayday.innerHTML
            }

            $.support.cors = true;
            axios.put(`http://54.180.251.177:3000/users/mypage/${user_id}`, req)
                .then(async (result) => {
                    Cookies.set("company_id", companyId);
                    const selectedCompany = data.find(company => company.id === companyId);
                    spanCompanyName.innerHTML = selectedCompany.name;

                    console.log("회원 정보 수정되었습니다.");
                }).catch((err) => {
                    console.error("회원 정보 수정에 실패했습니다.");
                });

        }).catch((err) => {
            console.error(err);
        });
}

function logout() {
    document.cookie = "user_id" + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    document.cookie = "company_id" + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    document.cookie = "diary_id" + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    location.href = './login.html'
}