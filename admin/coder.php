<?php
    //首先开启session
    isset($_SESSION) || session_start();
    //发送文件头
    header('Content-type:image/png');
    //创建一个图像的资源
    $im = imagecreate(90, 30);
    //创建颜色值
    $bgc            = imagecolorallocate($im, 255, 255, 255);
    $fontcolor      = imagecolorallocate($im, 20, 205, 108);
    $bordercolor    = imagecolorallocate($im, 102, 201, 120);
    $linecolor      = imagecolorallocate($im, 50, 80, 90);
    $pixcolor       = imagecolorallocate($im, 100, 20, 0);

    //填充背景颜色
    imagefill($im, 0, 0, $bgc);

    //画两个干扰线
    $l1_s_x = 0;
    $l1_s_y = rand(0, 30);
    $l1_e_x = 90;
    $l1_e_y = rand(0, 30);

    $l2_s_x = 0;
    $l2_s_y = rand(0, 30);
    $l2_e_x = 90;
    $l2_e_y = rand(0, 30);
    imageline($im, $l1_s_x, $l1_s_y, $l1_e_x, $l1_e_y, $linecolor);
    imageline($im, $l2_s_x, $l2_s_y, $l2_e_x, $l2_e_y, $linecolor);
    //画个边框
    imagerectangle($im, 0, 0, 90-1, 30-1, $bordercolor);

    //画很多点
    for($pi = 0; $pi < 200; $pi++){
        imagesetpixel($im, rand(0, 90), rand(0, 30), $pixcolor);
    }
    //随机生成一个数字字符串并保存到SESSION里面
    $code   = '';
    for($ci = 0; $ci < 5; $ci++){
        $code .= rand(0, 9);
    }
    $_SESSION['code'] = $code;

    //然后把随机生成的数字追加到图像里面
    $startx = 2;
    $fontfile = './simhei.ttf';
    for($ci = 0; $ci < 5; $ci++){
        $starty = rand(25, 29);
        imagettftext($im, 20, 20, $startx, $starty, $fontcolor, $fontfile, substr($code, $ci, 1));
        $startx += rand(16, 18);
    }
    
    //输出图片
    imagepng($im);
    //释放资源
    imagedestroy($im);