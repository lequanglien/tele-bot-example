

console.log("htllo");


const TelegramBot = require('node-telegram-bot-api');

// Thay thế YOUR_BOT_TOKEN bằng token của bot của bạn
const token = 'YOUR_BOT_TOKEN';



let pendingMembers = {};



// Tạo một bot sử dụng polling
const bot = new TelegramBot(token, {polling: true});

// Lắng nghe lệnh /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const url = 'https://google.com'; // URL của Mini App
  bot.sendMessage(chatId, 'Chào mừng bạn đến với bot của tôi!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Mini App 1', web_app: { url: url } }]
      ]
    }
  });
});

//Lắng nghe mọi tin nhắn và phản hồi lại bằng chính nội dung tin nhắn đó
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `on message :  ${JSON.stringify(msg)}`);
});

let pollVotes = {};

bot.on('poll', (poll) => {
  // const chatId = poll.chat.id;
  bot.sendMessage(chatId, `on poll`);

  // const pollId = poll.id;
  // const totalVoterCount = poll.total_voter_count;

  // // Lưu số lượng người vote cho poll này
  // pollVotes[pollId] = totalVoterCount;
  
  // console.log(`Poll ID: ${pollId}, Total Votes: ${totalVoterCount}`);
});

bot.on('poll_answer', (msg) => {
	console.log("poll_answer");
	console.log(msg);
} );


bot.on('poll_update', (msg) => {
	console.log("poll_update");
	console.log(msg);
} );
 
// Lệnh /poll để tạo một poll mới
bot.onText(/\/checkin/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendPoll(chatId, 'Điểm danh?', ['Checkin', 'Unknown'])
    .then((poll) => {
      // Khởi tạo số lượng vote cho poll này
      pollVotes[poll.poll.id] = 0;
    });
});




// Hàm xử lý thành viên mới tham gia nhóm
bot.on('new_chat_members', (msg) => {
  msg.new_chat_members.forEach((member) => {
    const chatId = msg.chat.id;
    const userId = member.id;

    pendingMembers[userId] = member;
    
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Tôi đồng ý', callback_data: `agree_${userId}` },
            { text: 'Tôi không đồng ý', callback_data: `disagree_${userId}` }
          ]
        ]
      }
    };

    bot.sendMessage(userId, `Chào mừng ${member.first_name}! Vui lòng nhập CAPTCHA hoặc đồng ý với các điều khoản để tiếp tục.`, options);
  });
});

// Hàm xử lý khi người dùng bấm vào các nút đồng ý hoặc không đồng ý
bot.on('callback_query', (query) => {
  const userId = query.from.id;
  const data = query.data.split('_');
  const action = data[0];
  const memberId = parseInt(data[1]);

  if (action === 'agree' && userId === memberId) {
    if (pendingMembers[userId]) {
      delete pendingMembers[userId];
      bot.editMessageText('Cảm ơn bạn đã đồng ý. Bạn đã được thêm vào nhóm.', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });
    } else {
      bot.editMessageText('Bạn đã đồng ý trước đó hoặc không cần xác thực.', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });
    }
  } else if (action === 'disagree' && userId === memberId) {
    bot.kickChatMember(query.message.chat.id, userId).then(() => {
      bot.editMessageText('Bạn đã bị loại khỏi nhóm do không đồng ý với các điều khoản.', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });
    });
  }
});




bot.startPolling();
