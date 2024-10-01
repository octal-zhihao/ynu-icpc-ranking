async function fetchUsers() {
    try {
        const response = await fetch('/atcoder/users.json'); // 假设users.json与HTML文件放在同一个目录下
        const data = await response.json();
        return data.users;  // 返回用户列表
    } catch (error) {
        console.error('获取用户列表时出错:', error);
        return [];
    }
}

function getUserClass(rating) {
    if (rating < 400) return 'gray';
    if (rating < 800) return 'brown';
    if (rating < 1200) return 'green';
    if (rating < 1600) return 'cyan';
    if (rating < 2000) return 'blue';
    if (rating < 2400) return 'yellow';
    if (rating < 2800) return 'orange';
    return 'red';
}

async function getUserRating(username) {
    try {
        const response = await fetch(`https://cp-api.octalzhihao.top/api/atcoder/${username}`);
        const data = await response.json();

        if (data.status === 'OK') {
            const newRating = parseInt(data.Rating, 10); // 转换为整数
            const maxRating = parseInt(data.HighestRating, 10); // 转换为整数
            return { username, rating: newRating, maxRating };
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
            const { username, rating, maxRating } = userData;
            const ratingClass = getUserClass(rating);
            const maxRatingClass = getUserClass(maxRating);

            const listItem = document.createElement('li');

            // 给前三名添加奖牌，不显示排名数字
            if (index === 0) listItem.classList.add('rank-1');
            else if (index === 1) listItem.classList.add('rank-2');
            else if (index === 2) listItem.classList.add('rank-3');
            else listItem.innerHTML = `${index + 1}. `;

            // 添加用户名、当前积分和最高积分信息
            listItem.innerHTML += `
                <a href="https://atcoder.jp/users/${username}" target="_blank" class="${ratingClass}">
                    ${username}: ${rating}
                </a>
                <span class="max-rating ${maxRatingClass}">(max. ${maxRating})</span>
            `;
            ratingsListElement.appendChild(listItem);
        });

    } catch (error) {
        console.error("获取评分数据时出错：", error);
    }
}

window.onload = displayRatings;
