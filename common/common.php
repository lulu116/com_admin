<?php
    //如何规避乱码问题：
    header('Content-type:text/html;charset="UTF-8"');
    //如果当前的PHP文件里面的代码是纯粹的PHP代码
    //结束标签最好省略
    // $dblink = new mysqli('localhost', 'root', '168168', 'com');
    // $dblink->query('SET NAMES UTF8');
    require './admin/class/DB.php';
    require './admin/config/db.config.php';
    $db = new DB($dbconfig);
