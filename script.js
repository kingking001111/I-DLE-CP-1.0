document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const cpQuestionSpan = document.getElementById('cp-question');
    const matchedCountSpan = document.getElementById('matched-count');
    const totalPairsSpan = document.getElementById('total-pairs');
    const resetButton = document.getElementById('reset-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const closeModalButton = document.getElementById('close-modal-button');

    // 這邊我根據你 GitHub 上的實際檔名做了修正
    // 注意：資料夾是大寫開頭，副檔名是 .jpeg
    const members = {
        "薇娟": ["Miyeon/miyeon_01.jpg", "Miyeon/miyeon_02.jpg", "Miyeon/miyeon_03.jpg", "Miyeon/miyeon_04.jpg", "Miyeon/miyeon_05.jpg"],
        "米妮": ["Minnie/minnie_01.jpg", "Minnie/minnie_02.jpg", "Minnie/minnie_03.jpg", "Minnie/minnie_04.jpg", "Minnie/minnie_05.jpg"],
        "穗珍": ["Soojin/soojin_01.jpg", "Soojin/soojin_02.jpg", "Soojin/soojin_03.jpg", "Soojin/soojin_04.jpg", "Soojin/soojin_05.jpg"],
        "小娟": ["Soyeon/soyeon_01.jpg", "Soyeon/soyeon_02.jpg", "Soyeon/soyeon_03.jpg", "Soyeon/soyeon_04.jpg", "Soyeon/soyeon_05.jpg"],
        "雨琦": ["Yuqi/yuqi_01.jpg", "Yuqi/yuqi_02.jpg", "Yuqi/yuqi_03.jpg", "Yuqi/yuqi_04.jpg", "Yuqi/yuqi_05.jpg"],
        "舒華": ["Shuhua/shuhua_01.jpg", "Shuhua/shuhua_02.jpg", "Shuhua/shuhua_03.jpg", "Shuhua/shuhua_04.jpg", "Shuhua/shuhua_05.jpg"]
    };

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

    let flippedCards = [];
    let matchedPairs = 0;
    let currentCP = null;
    let availableCPs = [];

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeGame() {
        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        gameOverModal.style.display = 'none'; // 確保一開始是隱藏的
        
        // 隨機選 8 組 CP 來玩，不然畫面會太擠
        availableCPs = shuffle([...cpDatabase]).slice(0, 8); 
        totalPairsSpan.textContent = availableCPs.length;

        let cardData = [];
        availableCPs.forEach(cp => {
            const m1 = cp.pair[0];
            const m2 = cp.pair[1];
            const img1 = members[m1][Math.floor(Math.random() * 5)];
            const img2 = members[m2][Math.floor(Math.random() * 5)];

            cardData.push({ member: m1, image: `./images/${img1}` });
            cardData.push({ member: m2, image: `./images/${img2}` });
        });

        shuffle(cardData).forEach(data => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.member = data.member;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">?</div>
                    <div class="card-front"><img src="${data.image}"></div>
                </div>`;
            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
        });

        pickNewCPQuestion();
        matchedCountSpan.textContent = "0";
    }

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('flipped');
            flippedCards.push(card);
            if (flippedCards.length === 2) setTimeout(checkForMatch, 800);
        }
    }

    function checkForMatch() {
        const [c1, c2] = flippedCards;
        const target = currentCP.pair;
        const isMatch = (c1.dataset.member === target[0] && c2.dataset.member === target[1]) ||
                        (c1.dataset.member === target[1] && c2.dataset.member === target[0]);

        if (isMatch) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            matchedPairs++;
            matchedCountSpan.textContent = matchedPairs;
            
            // 移除已完成的 CP
            availableCPs = availableCPs.filter(cp => cp !== currentCP);

            if (availableCPs.length === 0) {
                setTimeout(() => { gameOverModal.style.display = 'flex'; }, 500);
            } else {
                pickNewCPQuestion();
            }
        } else {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
        }
        flippedCards = [];
    }

    function pickNewCPQuestion() {
        if (availableCPs.length > 0) {
            currentCP = availableCPs[Math.floor(Math.random() * availableCPs.length)];
            cpQuestionSpan.textContent = currentCP.names[Math.floor(Math.random() * currentCP.names.length)];
        }
    }

    resetButton.addEventListener('click', initializeGame);
    closeModalButton.addEventListener('click', () => { gameOverModal.style.display = 'none'; initializeGame(); });

    initializeGame();
});
