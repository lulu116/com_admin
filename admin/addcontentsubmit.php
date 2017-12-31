<?php
    require './common/admin.common.php';

    $data                   = $_POST;
    $data['admin_id']       = $_SESSION['admin_id'];
    $data['realname']       = $_SESSION['realname'];
    $data['updatetimes']    = date('Y-m-d H:i:s');
    $data['recom']          = (int)$data['recommend'];
    unset($data['recommend']);
    //在修改信息的时候，会收到$_POST['cate_id']
    if($_POST['cate_id']){
        //修改信息
       // 删除多余的信息
       unset($data['cate_id']);
       $r = $db->updateData('news', $data, 'cate_id = ' . $_POST['cate_id']);
    }else{
        $data['addtimes']       = date('Y-m-d H:i:s');
        $r = $db->addData('news', $data);
    }
    
    if($r){
        echo json_encode(array('result'=>'success'));
    }else{
        echo json_encode(array('result'=>'fail'));
    }

