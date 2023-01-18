        var changePg1 = function(){
            $(".Pg").hide();
            $("#Pg1").show();
            $("#footimg2").attr("src","img/2.png");
            $("#footimg3").attr("src","img/3.png");
            $("#footimg4").attr("src","img/4.png");
            $("#footimg5").attr("src","img/5.png");
            $("#footimg1").attr("src","img/1_clicked.png");

        };
        var changePg2 = function(){
            $(".Pg").hide();
            $("#Pg2").show();
            $("#footimg1").attr("src","img/1.png");
            $("#footimg3").attr("src","img/3.png");
            $("#footimg4").attr("src","img/4.png");
            $("#footimg5").attr("src","img/5.png");
            $("#footimg2").attr("src","img/2_clicked.png");
        };
        var changePg3 = function(){
            $(".Pg").hide();
            $("#Pg3").show();
            $("#footimg2").attr("src","img/2.png");
            $("#footimg1").attr("src","img/1.png");
            $("#footimg4").attr("src","img/4.png");
            $("#footimg5").attr("src","img/5.png");
            $("#footimg3").attr("src","img/3_clicked.png");
            addpost();            
        };
        var changePg4 = function(){;
            $(".Pg").hide();
            $("#Pg4").show();
            $("#footimg2").attr("src","img/2.png");
            $("#footimg3").attr("src","img/3.png");
            $("#footimg1").attr("src","img/1.png");
            $("#footimg5").attr("src","img/5.png");
            $("#footimg4").attr("src","img/4_clicked.png");                       
                                   
        };
        var changePg5 = function(){
            console.log("changePg5:호출됨");
            $(".Pg").hide();
            $("#Pg5").show();
            $("#footimg2").attr("src","img/2.png");
            $("#footimg3").attr("src","img/3.png");
            $("#footimg4").attr("src","img/4.png");
            $("#footimg1").attr("src","img/1.png");
            $("#footimg5").attr("src","img/5_clicked.png");
            
        };        
        
        $(function(){
            $("#loginPg2").hide();
            $("#signupPg").hide();
            $("#Pg5_post").hide();
            $("#loginPg_signupbtn").touchstart(function(){
                $("#signupPg").show();
            });
            $("#loginPg_loginbtn").click(function(){
                $("#loginPg2").show();
            }); 
            //////////////////////////////////////////
            $("#signupPg_leftarrow").click(function(){
                $("#signupPg").hide();
            });
            ////////////////////////////////////////////
            $("#loginPg2_okbtn").touchstart(function(){
                $("#loginPg2_okbtn").attr('src',"img/okbtn_clicked.png");
                console.log('zz');
            });
            $("#loginPg2_okbtn").touchend(function(){
                $("#loginPg2_okbtn").attr("src","img/okbtn.png");
             
                //$("#loginPg").hide();
                //$("#loginPg2").hide();
                //changePg1();
            });
            $("#loginPg2_leftbtn").touchend(function(){
               $("#loginPg2").hide(); 
            });
            /////////////////////////////////////
            $("#footdiv1").touchstart(function(){
                $("#footimg1").attr("src","img/1_clicked.png");
            });
            $("#footdiv1").touchend(function(){
                changePg1();
            });
            
            $("#footdiv2").touchstart(function(){
                $("#footimg2").attr("src","img/2_clicked.png");
            });
            $("#footdiv2").touchend(function(){
                changePg2();
            });
            
            $("#footdiv3").touchstart(function(){
                 $("#footimg3").attr("src","img/3_clicked.png");
            });
            $("#footdiv3").touchend(function(){
                changePg3();
            });
            
            $("#footdiv4").touchstart(function(){
                $("#footimg4").attr("src","img/4_clicked.png");
            });
            $("#footdiv4").touchend(function(){
                changePg4();
            });
            
            $("#footdiv5").touchstart(function(){
                $("#footimg5").attr("src","img/5_clicked.png");
            });
            $("#footdiv5").touchend(function(){
                changePg5();
            });
            ////////////////////////////////////////
            $("#Pg5_profile_write").touchend(function(){
                $("#Pg5_post").show();
                $("#foot").hide();
            });
            
            $("#Pg5_post_leftbtn").touchend(function(){
                $("#Pg5_post").hide();
                console.log('leftbtn 터치');
                $("#foot").show();
            });
            
        });