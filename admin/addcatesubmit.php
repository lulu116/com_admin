<?php
    require './common/admin.common.php';

    $data                   = $_POST;
    $data['admin_id']       = $_SESSION['admin_id'];
    $data['realname']       = $_SESSION['realname'];
    $data['updatetimes']    = date('Y-m-d H:i:s');
    //在修改栏目信息的时候，会收到$_POST['cate_id']
    if($_POST['cate_id']){
        //修改栏目信息
        /*
        $sql = 'UPDATE cate SET parent_cate_id = ' . $_POST['parent_cate_id'] . ', catename = "'.$_POST['catename'].'", updatetimes="'.date('Y-m-d H:i:s').'" WHERE cate_id = ' . $_POST['cate_id'];
        $r = $db->dblink->query($sql);
        */
       // 删除多余的信息
       unset($data['cate_id']);
       $r = $db->updateData('cate', $data, 'cate_id = ' . $_POST['cate_id']);
    }else{
        $data['addtimes']       = date('Y-m-d H:i:s');
        $r = $db->addData('cate', $data);
    }
    
    if($r){
        echo json_encode(array('result'=>'success'));
    }else{
        echo json_encode(array('result'=>'fail'));
    }

