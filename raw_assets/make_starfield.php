<?php

$img = imagecreatetruecolor(1024, 1024);

for ($i=0;$i<1000;$i++){
    imagesetpixel($img, mt_rand(0, 1024), mt_rand(0, 1024), imagecolorallocate($img, 255, 255, 255));
}

imagepng($img, "/tmp/starfield1.png");
