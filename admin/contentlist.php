<?php 
    require './head.php';
    //获取全部的一级内容:左连接查询
    $sql = 'SELECT  n.news_id, n.title, n.cate_id_parent, 
                    n.cate_id_child, n.addtimes, n.realname, 
                    cp.catename AS cpname, 
                    cc.catename AS ccname
            FROM news AS n
            LEFT JOIN cate AS cp ON n.cate_id_parent = cp.cate_id
            LEFT JOIN cate AS cc ON n.cate_id_child = cc.cate_id
            ';
    $newslist = $db->dblink->query($sql);

?>
      <!-- BEGIN PAGE -->
      <div id="main-content">
         <!-- BEGIN PAGE CONTAINER-->
         <div class="container-fluid">
            <!-- BEGIN PAGE HEADER-->   
            <div class="row-fluid">
               <div class="span12">
                   <!-- BEGIN THEME CUSTOMIZER-->
                   <div id="theme-change" class="hidden-phone">
                       <i class="icon-cogs"></i>
                        <span class="settings">
                            <span class="text">Theme Color:</span>
                            <span class="colors">
                                <span class="color-default" data-style="default"></span>
                                <span class="color-green" data-style="green"></span>
                                <span class="color-gray" data-style="gray"></span>
                                <span class="color-purple" data-style="purple"></span>
                                <span class="color-red" data-style="red"></span>
                            </span>
                        </span>
                   </div>
                   <!-- END THEME CUSTOMIZER-->
                  <!-- BEGIN PAGE TITLE & BREADCRUMB-->
                   <h3 class="page-title">
                     内容列表
                   </h3>
                   <ul class="breadcrumb">
                       <li>
                           <a href="#">首页</a>
                           <span class="divider">/</span>
                       </li>
                       <li>
                           <a href="#">内容管理</a>
                           <span class="divider">/</span>
                       </li>
                       <li class="active">
                           内容列表
                       </li>
                       <li class="pull-right search-wrap">
                           <form action="search_result.html" class="hidden-phone">
                               <div class="input-append search-input-area">
                                   <input class="" id="appendedInputButton" type="text">
                                   <button class="btn" type="button"><i class="icon-search"></i> </button>
                               </div>
                           </form>
                       </li>
                   </ul>
                   <!-- END PAGE TITLE & BREADCRUMB-->
               </div>
            </div>
            <!-- END PAGE HEADER-->
            <!-- BEGIN PAGE CONTENT-->

            <div id="page-wraper">
                <div class="row-fluid">
                    <div class="span12">
                        <!-- BEGIN BASIC PORTLET-->
                        <div class="widget orange">
                            <div class="widget-title">
                                <h4><i class="icon-reorder"></i> 内容列表</h4>
                            </div>
                            <div class="widget-body">
                                <table class="table table-striped table-bordered table-advance table-hover">
                                    <thead>
                                    <tr>
                                        <th><i class="icon-bullhorn"></i> ID</th>
                                        <th class="hidden-phone"><i class="icon-question-sign"></i> 标题</th>
                                        <th class="hidden-phone"><i class="icon-question-sign"></i> 一级分类</th>
                                        <th class="hidden-phone"><i class="icon-question-sign"></i> 二级分类</th>
                                        <th><i class="icon-bookmark"></i> 添加时间</th>
                                        <th><i class="icon-bookmark"></i> 操作人</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <?php 
                                        foreach ($newslist as $key =>$value){
                                    ?>
                                        <tr id="tr_<?=$cv['cate_id'];?>">
                                             <td><a href="#"><?=$value['news_id'];?></a></td>
                                             <td class="hidden-phone"><?=$value['title'];?></td>
                                             <td class="hidden-phone"><?=$value['cpname'];?></td>
                                             <td class="hidden-phone"><?=$value['ccname'];?></td>
                                           
                                            <td><?=$value['addtimes'];?></td>
                                            <td><?=$value['realname'];?></td>
                                            <td>
                                                <a href="updatenews.php?cate_id=<?=$value['cate_id'];?>" class="btn btn-primary"><i class="icon-pencil"></i></a>
                                                <button type="button" cate_id="<?=$value['cate_id'];?>" class="btn btn-danger delcate"><i class="icon-trash "></i></button>
                                            </td>
                                        </tr>
                                    <?php
                                        }
                                    ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- END BASIC PORTLET-->
                    </div>
                </div>

            </div>

            <!-- END PAGE CONTENT-->         
         </div>
         <!-- END PAGE CONTAINER-->
      </div>
      <!-- END PAGE -->
    <?php 
        require './foot.php';
    ?>