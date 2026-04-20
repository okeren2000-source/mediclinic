// JavaScript Document
            al = document.getElementsByTagName('head')[0],
            bl = document.getElementsByTagName('body')[0];
// includ jquary first
						var script = document.createElement('script');
                        script.src   = 'https://code.jquery.com/jquery-3.3.1.min.js';
                        script.async = '';
                        script.defer = '';
                        al.appendChild(script);
						
// wait for jquary to be ready before including the leader pixel content
            var wait_for_jquary = window.setInterval(function(){
                try{
                    if( $() ){

                        window.clearInterval(wait_for_jquary);

                        var script = document.createElement('script');
                        script.src   = 'https://sites.leader.online/pixel/lp.lasertips.co.il/leader_content.js';
                        script.async = '';
                        script.defer = '';
                        bl.appendChild(script);

                    }
                }catch(e){}
            },100);
