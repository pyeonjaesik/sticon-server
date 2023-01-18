 //52.79.242.96
module.exports = {
        server_port: 3000,
        db_url: 'mongodb://localhost:27017/202198',
        db_schemas: [
                {file:'./user_schema', collection:'user', schemaName:'UserSchema', modelName:'UserModel'},
                {file:'./tk_schema', collection:'tk', schemaName:'TkSchema', modelName:'TkModel'},
                {file:'./lv_schema', collection:'lv', schemaName:'LvSchema', modelName:'LvModel'},
                {file:'./coin_schema', collection:'coin', schemaName:'CoinSchema', modelName:'CoinModel'},
                {file:'./alarm_schema', collection:'alarm', schemaName:'AlarmSchema', modelName:'AlarmModel'},
                {file:'./follow_schema', collection:'follow', schemaName:'FollowSchema', modelName:'FollowModel'},
                {file:'./qna_schema', collection:'qna', schemaName:'QnASchema', modelName:'QnAModel'},
                {file:'./mct_schema', collection:'mct', schemaName:'MctSchema', modelName:'MctModel'},
                {file:'./post_schema', collection:'post', schemaName:'PostSchema', modelName:'PostModel'},
                {file:'./chatroom_schema', collection:'chatroom', schemaName:'ChatRoomSchema', modelName:'ChatRoomModel'},
                {file:'./video_schema', collection:'video', schemaName:'VideoSchema', modelName:'VideoModel'},
                {file:'./comment_schema', collection:'comment', schemaName:'CommentSchema', modelName:'CommentModel'},
                {file:'./ms_schema', collection:'ms', schemaName:'MsSchema', modelName:'MsModel'},
                {file:'./group_schema', collection:'group', schemaName:'GroupSchema', modelName:'GroupModel'},
                {file:'./contacts_schema', collection:'contacts', schemaName:'ContactsSchema', modelName:'ContactsModel'},
                {file:'./sticker_schema', collection:'sticker', schemaName:'StickerSchema', modelName:'StickerModel'},
                {file:'./tag_schema', collection:'tag', schemaName:'TagSchema', modelName:'TagModel'},
        ],
        route_info: [
                {file:'./user',path:'/login', method:'login', type:'post'}
                ,{file:'./signupfacebook',path:'/signupfacebook',method:'signupfacebook', type:'post'}
                ,{file:'./signupkakao',path:'/signupkakao',method:'signupkakao', type:'post'}
                ,{file:'./signupnaver',path:'/signupnaver',method:'signupnaver', type:'post'}
                ,{file:'./signupapple',path:'/signupapple',method:'signupapple', type:'post'}
                ,{file:'./signupgoogle',path:'/signupgoogle',method:'signupgoogle', type:'post'}
                ,{file:'./setuid',path:'/setuid',method:'setuid', type:'post'}
                ,{file:'./cert',path:'/cert',method:'cert',type:'post'}
                ,{file:'./cert_group',path:'/cert_group',method:'cert_group',type:'post'}
                ,{file:'./setnick',path:'/setnick',method:'setnick', type:'post'}
                ,{file:'./setnickapple',path:'/setnickapple',method:'setnickapple', type:'post'}
                ,{file:'./setnickkakao',path:'/setnickkakao',method:'setnickkakao', type:'post'}
                ,{file:'./setnicknaver',path:'/setnicknaver',method:'setnicknaver', type:'post'}
                ,{file:'./setpw',path:'/setpw',method:'setpw', type:'post'}
                ,{file:'./setpwapple',path:'/setpwapple',method:'setpwapple', type:'post'}
                ,{file:'./setpwkakao',path:'/setpwkakao',method:'setpwkakao', type:'post'}
                ,{file:'./setpwnaver',path:'/setpwnaver',method:'setpwnaver', type:'post'}
                ,{file:'./signin',path:'/signin',method:'signin', type:'post'}
                ,{file:'./autologin',path:'/autologin',method:'autologin', type:'post'}
                ,{file:'./setintroduce',path:'/setintroduce',method:'setintroduce', type:'post'}
                ,{file:'./setinstagram',path:'/setinstagram',method:'setinstagram', type:'post'}
                ,{file:'./setyoutube',path:'/setyoutube',method:'setyoutube', type:'post'}
                ,{file:'./settiktok',path:'/settiktok',method:'settiktok', type:'post'}
                ,{file:'./setafrica',path:'/setafrica',method:'setafrica', type:'post'}
                ,{file:'./setvanhana',path:'/setvanhana',method:'setvanhana', type:'post'}
                ,{file:'./getmainpost',path:'/getmainpost',method:'getmainpost', type:'post'}
                ,{file:'./getmainpost140',path:'/getmainpost140',method:'getmainpost140', type:'post'}
                ,{file:'./getmaingallery',path:'/getmaingallery',method:'getmaingallery', type:'post'}
                ,{file:'./getmainpostadmin',path:'/getmainpostadmin',method:'getmainpostadmin', type:'post'}
                ,{file:'./getprofile',path:'/getprofile',method:'getprofile', type:'post'}
                ,{file:'./setprice',path:'/setprice',method:'setprice', type:'post'}
                ,{file:'./makemct',path:'/makemct',method:'makemct', type:'post'}
                ,{file:'./paymentcomplete',path:'/payments/complete',method:'paymentcomplete', type:'post'}
                ,{file:'./verifypw',path:'/verifypw',method:'verifypw', type:'post'}
                ,{file:'./getchatlist',path:'/getchatlist',method:'getchatlist', type:'post'}
                ,{file:'./talk',path:'/talk',method:'talk', type:'post'}
                ,{file:'./gettalk',path:'/gettalk',method:'gettalk', type:'post'}
                ,{file:'./talkread',path:'/talkread',method:'talkread', type:'post'}
                ,{file:'./mscp',path:'/mscp',method:'mscp', type:'post'}
                ,{file:'./following',path:'/following',method:'following', type:'post'}
                ,{file:'./unfollowing',path:'/unfollowing',method:'unfollowing', type:'post'}
                ,{file:'./loving',path:'/loving',method:'loving', type:'post'}
                ,{file:'./unloving',path:'/unloving',method:'unloving', type:'post'}
                ,{file:'./verifykakao',path:'/verifykakao',method:'verifykakao', type:'post'}
                ,{file:'./verifynaver',path:'/verifynaver',method:'verifynaver', type:'post'}
                ,{file:'./verifyapple',path:'/verifyapple',method:'verifyapple', type:'post'}
                ,{file:'./findperson',path:'/findperson',method:'findperson', type:'post'}
                ,{file:'./findgroup',path:'/findgroup',method:'findgroup', type:'post'}
                ,{file:'./grouping',path:'/grouping',method:'grouping', type:'post'}
                ,{file:'./ungrouping',path:'/ungrouping',method:'ungrouping', type:'post'}
                ,{file:'./getinfouni',path:'/getinfouni',method:'getinfouni', type:'post'}
                ,{file:'./videoread',path:'/videoread',method:'videoread', type:'post'}
                ,{file:'./getgroupmember',path:'/getgroupmember',method:'getgroupmember', type:'post'}
                ,{file:'./push',path:'/push',method:'push', type:'post'}
                ,{file:'./deletepost',path:'/deletepost',method:'deletepost', type:'post'}
                ,{file:'./reportpost',path:'/reportpost',method:'reportpost', type:'post'}
                ,{file:'./getreadprofile',path:'/getreadprofile',method:'getreadprofile', type:'post'}
                ,{file:'./getgroup',path:'/getgroup',method:'getgroup', type:'post'}
                ,{file:'./getfollow',path:'/getfollow',method:'getfollow', type:'post'}
                ,{file:'./setphone',path:'/setphone',method:'setphone', type:'post'}
                ,{file:'./setcontacts',path:'/setcontacts',method:'setcontacts', type:'post'}
                ,{file:'./getchat',path:'/getchat',method:'getchat', type:'post'}
                ,{file:'./blockuser',path:'/blockuser',method:'blockuser', type:'post'}
                ,{file:'./comment',path:'/comment',method:'comment', type:'post'}
                ,{file:'./getcomment',path:'/getcomment',method:'getcomment', type:'post'}
                ,{file:'./commentRead',path:'/commentRead',method:'commentRead', type:'post'}
                ,{file:'./getalarm',path:'/getalarm',method:'getalarm', type:'post'}
                ,{file:'./getonevideo',path:'/getonevideo',method:'getonevideo', type:'post'}
                ,{file:'./groupagree',path:'/groupagree',method:'groupagree', type:'post'}
                ,{file:'./groupdisagree',path:'/groupdisagree',method:'groupdisagree', type:'post'}
                ,{file:'./disconnect',path:'/disconnect',method:'disconnect', type:'post'}
                ,{file:'./checkpush',path:'/checkpush',method:'checkpush', type:'post'}
                ,{file:'./makecloud',path:'/makecloud',method:'makecloud', type:'post'}
                ,{file:'./makehotcloud',path:'/makehotcloud',method:'makehotcloud', type:'post'}
                ,{file:'./cellread',path:'/cellread',method:'cellread', type:'post'}
                ,{file:'./gethotgallery',path:'/gethotgallery',method:'gethotgallery', type:'post'}
                ,{file:'./getgroupgallery',path:'/getgroupgallery',method:'getgroupgallery', type:'post'}
                ,{file:'./invite',path:'/invite',method:'invite', type:'get'}
                ,{file:'./invitemembers',path:'/invitemembers',method:'invitemembers', type:'post'}
                ,{file:'./groupout',path:'/groupout',method:'groupout', type:'post'}
                ,{file:'./getgroupscreen',path:'/getgroupscreen',method:'getgroupscreen', type:'post'}
                ,{file:'./requesting',path:'/requesting',method:'requesting', type:'post'}
                ,{file:'./unrequesting',path:'/unrequesting',method:'unrequesting', type:'post'}
                ,{file:'./followagree',path:'/followagree',method:'followagree', type:'post'}
                ,{file:'./followdisagree',path:'/followdisagree',method:'followdisagree', type:'post'}
                ,{file:'./toggleshow',path:'/toggleshow',method:'toggleshow', type:'post'}
                ,{file:'./cancelpost',path:'/cancelpost',method:'cancelpost', type:'post'}
                ,{file:'./findtag',path:'/findtag',method:'findtag', type:'post'}
                ,{file:'./findsticker',path:'/findsticker',method:'findsticker', type:'post'}
                ,{file:'./deletegallery',path:'/deletegallery',method:'deletegallery', type:'post'}
                ,{file:'./readalarm',path:'/readalarm',method:'readalarm', type:'post'}
                ,{file:'./autosticker',path:'/autosticker',method:'autosticker', type:'post'}
                ,{file:'./cancelinvite',path:'/cancelinvite',method:'cancelinvite', type:'post'}
                ,{file:'./getgroupid',path:'/getgroupid',method:'getgroupid', type:'post'}

        ],
        serverKey:'AAAADfWxK8M:APA91bGrRGS67itiAYirYnsMb980IVAHHm_lqoKmiNBLiluS33udl4mrF6LLjBl6VtgAZgTaWFheWUccF5HbjstmiLPorm3TGaW5qUOByjn7ChEgGnxZcb9m6SwL5UmfnRkf5zxrz1qZ',
        galleryBucket:'sticongallery',
        sticonBucket:'sticonsticker',
        profileImgBucket:'sticonprofile',
        groupImgBucket:'sticongroup',
        takeURL:'http://www.sticon.site'
}