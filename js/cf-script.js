async function fetchUsers() {
try {
    const response = await fetch('/codeforces/users.json'); // 假设users.json与HTML文件放在同一个目录下
    const data = await response.json();
    return data.users;  // 返回用户列表
} catch (error) {
    console.error('获取用户列表时出错:', error);
    return [];
}
}

function getUserClassAndTitle(rating) {
if (rating < 1200) return { class: 'newbie', title: 'Newbie' };
if (rating < 1400) return { class: 'pupil', title: 'Pupil' };
if (rating < 1600) return { class: 'specialist', title: 'Specialist' };
if (rating < 1900) return { class: 'expert', title: 'Expert' };
if (rating < 2100) return { class: 'candidate-master', title: 'Candidate Master' };
if (rating < 2300) return { class: 'master', title: 'Master' };
if (rating < 2400) return { class: 'international-master', title: 'International Master' };
if (rating < 3000) return { class: 'grandmaster', title: 'Grandmaster' };
return { class: 'legendary-grandmaster', title: 'Legendary Grandmaster' };
}

async function getUserRating(username) {
try {
    const response = await fetch(`https://cp-api.octalzhihao.top/api/codeforces/${username}`);
    const data = await response.json();

    if (data.status === 'OK') {
        const newRating = data.rating;
        const maxRating = data.maxRating;
        const maxRank = data.maxRank;
        return { username, rating: newRating, maxRating, maxRank };
    } else {
        return { username, rating: null, error: '获取数据失败' };
    }
} catch (error) {
    return { username, rating: null, error: '请求失败' };
}
}

async function displayRatings() {
const ratingsListElement = document.getElementById('ratings-list');
const ratingsData = [];

// 通过 fetchUsers 获取用户列表
const users = await fetchUsers();

if (users.length === 0) {
    console.error('用户列表为空或无法获取');
    return;
}

// 并发获取所有用户的评分数据
const fetchPromises = users.map(user => getUserRating(user));

try {
    const results = await Promise.all(fetchPromises);

    results.forEach(userData => {
        if (userData.rating !== null) {
            ratingsData.push(userData);
        }
    });

    // 按积分从大到小排序
    ratingsData.sort((a, b) => b.rating - a.rating);

    // 清空之前的列表
    ratingsListElement.innerHTML = '';

    // 显示排序后的用户列表
    ratingsData.forEach((userData, index) => {
        const { username, rating, maxRating, maxRank } = userData;
        const { class: ratingClass, title: currentTitle } = getUserClassAndTitle(rating);
        const { class: maxRatingClass, title: maxTitle } = getUserClassAndTitle(maxRating);

        const listItem = document.createElement('li');

        // 给前三名添加奖牌，不显示排名数字
        if (index === 0) listItem.classList.add('rank-1');
        else if (index === 1) listItem.classList.add('rank-2');
        else if (index === 2) listItem.classList.add('rank-3');
        else listItem.innerHTML = `${index + 1}. `;

        // 添加用户名、当前积分和最高积分信息
        listItem.innerHTML += `
            <a href="https://codeforces.com/profile/${username}" target="_blank" class="${ratingClass}">
                ${username}: ${rating} (${currentTitle})
            </a>
            <span class="max-rating ${maxRatingClass}">(max. ${maxTitle}, ${maxRating})</span>
        `;
        ratingsListElement.appendChild(listItem);
    });

} catch (error) {
    console.error("获取评分数据时出错：", error);
}
}

window.onload = displayRatings;
