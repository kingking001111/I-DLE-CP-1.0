document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const cpQuestionSpan = document.getElementById('cp-question');
    const matchedCountSpan = document.getElementById('matched-count');
    const totalPairsSpan = document.getElementById('total-pairs');
    const resetButton = document.getElementById('reset-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const closeModalButton = document.getElementById('close-modal-button');

    // 所有的成員和她們的圖片檔案名 (你需要將圖片下載並放入 images/ 對應資料夾)
    // 範例: images/miyeon/miyeon_01.jpg
    const members = {
        "薇娟": ["miyeon/miyeon_01.jpg", "miyeon/miyeon_02.jpg", "miyeon/miyeon_03.jpg", "miyeon/miyeon_04.jpg", "miyeon/miyeon_05.jpg"],
        "米妮": ["minnie/minnie_01.jpg", "minnie/minnie_02.jpg", "minnie/minnie_03.jpg", "minnie/minnie_04.jpg", "minnie/minnie_05.jpg"],
        "穗珍": ["soojin/soojin_01.jpg", "soojin/soojin_02.jpg", "soojin/soojin_03.jpg", "soojin/soojin_04.jpg", "soojin/soojin_05.jpg"],
        "小娟": ["soyeon/soyeon_01.jpg", "soyeon/soyeon_02.jpg", "soyeon/soyeon_03.jpg", "soyeon/soyeon_04.jpg", "soyeon/soyeon_05.jpg"],
        "雨琦": ["yuqi/yuqi_01.jpg", "yuqi/yuqi_02.jpg", "yuqi/yuqi_03.jpg", "yuqi/yuqi_04.jpg", "yuqi/yuqi_05.jpg"],
        "舒華": ["shuhua/shuhua_01.jpg", "shuhua/shuhua_02.jpg", "shuhua/shuhua_03.jpg", "shuhua/shuhua_04.jpg", "shuhua/shuhua_05.jpg"]
    };

    // CP 關係邏輯庫 (基於你提供的)
    const cpDatabase = [
        {"names": ["狗狗姊妹", "大姐Line", "麵查"], "pair": ["薇娟", "米妮"]},
        {"names": ["穗面CP"], "pair": ["薇娟", "穗珍"]},
        {"names": ["大小娟", "麵捲CP"], "pair": ["薇娟", "小娟"]},
        {"names": ["團欺Line", "姐弟Line"], "pair": ["薇娟", "雨琦"]},
        {"names": ["樹莓CP", "TJ"], "pair": ["薇娟", "舒華"]},
        {"names": ["宿命CP"], "pair": ["米妮", "穗珍"]},
        {"names": ["米捲"], "pair": ["米妮", "小娟"]},
        {"names": ["米琦", "室友Line"], "pair": ["米妮", "雨琦"]},
        {"names": ["油豆腐CP", "米舒"], "pair": ["米妮", "舒華"]},
        {"names": ["98Line", "父母Line"], "pair": ["穗珍", "小娟"]},
        {"names": ["BoBo CP", "母子Line"], "pair": ["穗珍", "雨琦"]},
        {"names": ["碎花"], "pair": ["穗珍", "舒華"]},
        {"names": ["捲餅"], "pair": ["小娟", "雨琦"]},
        {"names": ["花捲"], "pair": ["小娟", "舒華"]},
        {"names": ["忙內Line"], "pair": ["雨琦", "舒華"]}
    ];

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let currentCP = null; // 當前需要配對的 CP
    let availableCPs = []; // 尚未配對的 CP 列表

    // 輔助函數：隨機打亂陣列
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 初始化遊戲板
    function initializeGame() {
        gameBoard.innerHTML = ''; // 清空遊戲板
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        
        // 選擇所有可能的 CP 組合作為遊戲的「對子」
        availableCPs = shuffle([...cpDatabase]); 
        
        // 為每個 CP 配對生成兩張卡牌
        let cardData = [];
        const uniqueMembersInGame = new Set(); // 追蹤哪些成員的卡片被選入了這次遊戲

        // 確保每個 CP 的兩位成員都能有卡片
        availableCPs.forEach(cp => {
            const member1 = cp.pair[0];
            const member2 = cp.pair[1];
            
            uniqueMembersInGame.add(member1);
            uniqueMembersInGame.add(member2);

            // 從每位成員的圖片庫中隨機選一張
            const img1 = members[member1][Math.floor(Math.random() * members[member1].length)];
            const img2 = members[member2][Math.floor(Math.random() * members[member2].length)];

            cardData.push({ id: `${member1}_${Date.now()}_1`, member: member1, image: `./images/${img1}` });
            cardData.push({ id: `${member2}_${Date.now()}_2`, member: member2, image: `./images/${img2}` });
        });

        // 打亂所有卡牌
        cardData = shuffle(cardData);

        // 確保遊戲板的卡牌數量是偶數，且足以形成 CP
        // 這個簡單的邏輯確保了至少有足夠的卡片來組成 CP
        // 實際遊戲可能需要更複雜的邏片來保證所有 CP 都能被選中並有足夠卡片
        
        // 目前設計是所有 CP 都會生成卡片，但遊戲板只顯示一部分
        // 為了簡化，我們先隨機選擇12-18張卡片，確保是偶數
        const numCardsToDisplay = Math.min(cardData.length, 18); // 最多顯示18張
        cardData = cardData.slice(0, numCardsToDisplay - (numCardsToDisplay % 2)); // 確保偶數

        totalPairsSpan.textContent = availableCPs.length; // 顯示總共有多少 CP 需要配對

        cardData.forEach(data => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.member = data.member; // 記錄卡片是哪個成員
            cardElement.dataset.id = data.id; // 唯一ID

            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-back"></div>
                    <div class="card-front"><img src="${data.image}" alt="${data.member}"></div>
                </div>
            `;
            cardElement.addEventListener('click', () => flipCard(cardElement));
            gameBoard.appendChild(cardElement);
            cards.push(cardElement);
        });

        pickNewCPQuestion(); // 選一個新的 CP 題目
        updateMatchedCount();
    }

    // 翻牌邏輯
    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                setTimeout(checkForMatch, 1000); // 1秒後檢查是否配對成功
            }
        }
    }

    // 檢查是否配對成功
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const member1 = card1.dataset.member;
        const member2 = card2.dataset.member;

        const targetCP = currentCP.pair; // 當前題目的 CP 成員

        // 檢查是否符合題目的 CP 配對 (成員順序不重要)
        const isMatch = (member1 === targetCP[0] && member2 === targetCP[1]) ||
                        (member1 === targetCP[1] && member2 === targetCP[0]);

        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            updateMatchedCount();

            // 從 availableCPs 中移除已配對的 CP
            availableCPs = availableCPs.filter(cp => 
                !(cp.pair.includes(targetCP[0]) && cp.pair.includes(targetCP[1]))
            );

            if (availableCPs.length === 0) {
                // 所有 CP 都配對成功，遊戲結束
                gameOverModal.style.display = 'flex';
            } else {
                pickNewCPQuestion(); // 繼續出下一個 CP 題目
            }
        } else {
            // 不匹配，翻回去
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        flippedCards = []; // 清空已翻的卡片
    }

    // 選擇新的 CP 題目
    function pickNewCPQuestion() {
        if (availableCPs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCPs.length);
            currentCP = availableCPs[randomIndex];
            // 隨機選一個 CP 名稱作為題目
            const randomNameIndex = Math.floor(Math.random() * currentCP.names.length);
            cpQuestionSpan.textContent = currentCP.names[randomNameIndex];
        } else {
            cpQuestionSpan.textContent = "所有CP都已配對！";
        }
    }

    // 更新配對計數
    function updateMatchedCount() {
        matchedCountSpan.textContent = matchedPairs;
    }

    // 重新開始遊戲
    resetButton.addEventListener('click', initializeGame);

    // 關閉遊戲結束彈窗
    closeModalButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        initializeGame(); // 關閉彈窗後重新開始遊戲
    });

    // 初始啟動遊戲
    initializeGame();
});
