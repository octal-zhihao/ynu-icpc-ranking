async function fetchUsers() {
    try {
        const response = await fetch('/nowcoder/users.json');
        const data = await response.json();
        return data.users;  // 返回用户列表
    } catch (error) {
        console.error('获取用户列表时出错:', error);
        return [];
    }
}

function getUserClassByRating(rating) {
    if (rating < 700) return { class: 'nc-gray' };
    if (rating < 1100) return { class: 'nc-purple' };
    if (rating < 1500) return { class: 'nc-blue' };
    if (rating < 2000) return { class: 'nc-green' };
    if (rating < 2400) return { class: 'nc-yellow' };
    if (rating < 2800) return { class: 'nc-orange' };
    return { class: 'nc-red' };
}

async function getUserRating(userid) {
    try {
        const response = await fetch(`https://cp-api.octalzhihao.top/api/nowcoder/${userid}`);
        const data = await response.json();

        if (data.status === 'OK') {
            const { username, rating } = data;
            return { userid, username, rating };
        } else {
            return { userid, username: userid, rating: null, error: '获取数据失败' };
        }
    } catch (error) {
        return { userid, username: userid, rating: null, error: '请求失败' };
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
            const { userid, username, rating } = userData;
            const { class: ratingClass } = getUserClassByRating(rating);

            const listItem = document.createElement('li');

            // 给前三名添加奖牌，不显示排名数字
            if (index === 0) listItem.classList.add('rank-1');
            else if (index === 1) listItem.classList.add('rank-2');
            else if (index === 2) listItem.classList.add('rank-3');
            else listItem.innerHTML = `${index + 1}. `;

            // 添加用户名和积分信息，并链接到 Nowcoder 用户主页
            listItem.innerHTML += `
                <a href="https://ac.nowcoder.com/acm/contest/profile/${userid}" target="_blank" class="${ratingClass}">
                    ${username}: ${rating}
                </a>
            `;
            ratingsListElement.appendChild(listItem);
        });

    } catch (error) {
        console.error("获取评分数据时出错：", error);
    }
}

window.onload = displayRatings;
