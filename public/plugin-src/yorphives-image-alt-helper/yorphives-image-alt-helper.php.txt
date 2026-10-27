<?php
/**
 * Plugin Name: YorpHives Image Alt Helper
 * Description: Highlights images in a post or page that may need alternative text. A local editorial aid, not an automatic image description service.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: YorpHives
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
add_action('add_meta_boxes', function () { foreach (array('post','page') as $type) add_meta_box('yhiah-box','YorpHives Image Alt Helper','yhiah_render',$type,'side','default'); });
function yhiah_render($post) { if (!current_user_can('edit_post',$post->ID)) return; echo '<p>Review image alternative text in this draft. This tool does not generate descriptions or change your content.</p><button type="button" class="button" id="yhiah-run">Review images</button><div id="yhiah-results" aria-live="polite"><p>Run a review to see image checks.</p></div><script>(function(){const b=document.getElementById("yhiah-run");if(!b)return;b.addEventListener("click",function(){let h="";try{const ed=window.tinymce&&tinymce.get("content");const html=ed&&!ed.isHidden()?ed.getContent():document.getElementById("content").value;const d=new DOMParser().parseFromString(html,"text/html");const imgs=[...d.querySelectorAll("img")];if(!imgs.length)h="<p>No images found in the current editor content.</p>";else{h="<p>Found "+imgs.length+" image(s).</p><ul>";imgs.forEach((im,i)=>{const alt=im.getAttribute("alt");const label=im.getAttribute("src")||"Image "+(i+1);h+="<li>"+(alt===null?"Missing alt attribute":alt.trim()===""?"Empty alt text":"Alt text present")+" — "+String(label).replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))+"</li>"});h+="</ul><p>Decorative images may correctly use an empty alt attribute. Check each image's purpose.</p>"}}catch(e){h="<p>Could not inspect editor content. Try switching to the Code editor or saving the draft first.</p>"}document.getElementById("yhiah-results").innerHTML=h;});})();</script>'; }