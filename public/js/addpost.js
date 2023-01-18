        var addpost = function(){
            console.log('addpost 터치');
            var post = $("<div></div>");
            var user_img ='img/profile.png';
            var main_img ='img/logo_green.png';
            var username = '편재식';
            post.css({"position":"relative","width":"100%"});
            post.html("<div id='header'><img src='"+user_img+"' id='header_img'><span id='header_username'>"+username+"</span></div><img src='"+main_img+"' id='main_img'><div id='footer'></div> ")
            var element = $("#postarea3");
            $("#header_follow").click(function(){
                $("#header_follow").hide();
                console.log('header_follow 클릭됨');
            });
            
            var follow = $("<div>팔로우</div>");
            follow.css({"position":"absolute","top":"15px","right":"30%","fontSize":"15px","color":"green"});
            post.append(follow);
            
            var heart = $("<img></img>");
           heart.attr("src","img/heart.png"); heart.css({"position":"absolute","bottom":"5px","left":"12px","width":"30px"});
            post.append(heart);
            
            var reply = $("<img></img>");
            reply.attr("src","img/reply.png");
            reply.css({"position":"absolute","bottom":"5px","left":"52px","width":"30px"});
            post.append(reply);
            element.append(post);
            
            follow.click(function(){
                follow.hide();
                console.log('팔로우 클릭됨');
            });
        };