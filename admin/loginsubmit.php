<?php
    require './common/common.php';
    //验证验证码是否有效
    if($_POST['code'] != $_SESSION['code']){
        $r['res'] = 'invail_code';
        echo json_encode($r);
        exit;
    }
    /*
    $sql    = 'SELECT * FROM admin WHERE realname = "'.$_POST['realname'].'"';
    $result = $dblink->query($sql);
    $row    = $result->fetch_array(MYSQLI_ASSOC);
    */
    //
    $row = $db->getOneData('admin', '*', 'realname = "'.$_POST['realname'].'"');
    //检查账号是否存在
    if(!$row){
        // echo '账号不存在';
        //PHP里面如何输出JSON格式的数据：json_encode(数组);
        $r['res'] = 'no_exit_realname';
        echo json_encode($r);
        exit;
    }

    //检查密码是否正确
    if(md5($_POST['passwd123']) != $row['passwd']){
        //PHP里面如何输出JSON格式的数据：json_encode(数组);
        $r['res'] = 'invail_passwd';
        echo json_encode($r);
        exit;
    }

    //更新登录信息
    //now():SQL返回时间的内置函数
    $sql = 'UPDATE admin SET loginnum = loginnum + 1, lastlogin=now() WHERE admin_id = ' . $row['admin_id'];
    $db->dblink->query($sql);

    //开始存储COOKIE信息:选中的时候存储，没有选中就要销毁
    if($_POST['remember'] == '1'){
        //把用户的账号及密码存储到COOKIE里面
        setcookie('realname',   $row['realname'],       time() + 720*3600);
        setcookie('passwd',     $_POST['passwd123'],    time() + 720*3600);
    }else{
        //销毁COOKIE信息
        setcookie('realname',   '',    time() - 720*3600);
        setcookie('passwd',     '',    time() - 720*3600);
    }

    //存储登录用户的信息到SESSION
    $_SESSION['realname']   = $row['realname'];
    $_SESSION['tel']        = $row['tel'];
    $_SESSION['admin_id']   = $row['admin_id'];


    //登录成功
    $r['res'] = 'ok';
    $r['result'] = 'ok';
    echo json_encode($r);

