-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 2017-11-02 10:18:13
-- 服务器版本： 5.7.17-log
-- PHP Version: 5.5.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `com`
--

-- --------------------------------------------------------

--
-- 表的结构 `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL COMMENT '管理员ID',
  `realname` char(16) COLLATE utf8_czech_ci NOT NULL COMMENT '管理员姓名',
  `passwd` char(32) COLLATE utf8_czech_ci NOT NULL COMMENT '管理员密码',
  `tel` char(11) COLLATE utf8_czech_ci DEFAULT '0' COMMENT '管理员手机号',
  `Loginnum` int(11) NOT NULL DEFAULT '0' COMMENT '登录次数',
  `Lastlogin` datetime DEFAULT NULL COMMENT '最后一次登录时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- 转存表中的数据 `admin`
--

INSERT INTO `admin` (`admin_id`, `realname`, `passwd`, `tel`, `Loginnum`, `Lastlogin`) VALUES
(1, '超级管理员', 'e10adc3949ba59abbe56e057f20f883e', '15881328936', 47, '2017-09-21 14:05:48'),
(2, '刘婷', 'e10adc3949ba59abbe56e057f20f883e', '15584674474', 22, '2017-09-19 22:17:36');

-- --------------------------------------------------------

--
-- 表的结构 `cate`
--

CREATE TABLE `cate` (
  `cate_id` int(11) NOT NULL COMMENT '主键',
  `catename` char(50) COLLATE utf8_czech_ci NOT NULL COMMENT '栏目名称',
  `Parent_cate_id` int(11) NOT NULL COMMENT '父级的栏目ID，如果是0，代表一级分类',
  `admin_id` int(11) NOT NULL COMMENT '操作者主键ID',
  `realname` char(16) COLLATE utf8_czech_ci NOT NULL COMMENT '操作者的姓名',
  `addtimes` datetime NOT NULL COMMENT '添加时间',
  `updatetimes` datetime NOT NULL COMMENT '最后修改时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- 转存表中的数据 `cate`
--

INSERT INTO `cate` (`cate_id`, `catename`, `Parent_cate_id`, `admin_id`, `realname`, `addtimes`, `updatetimes`) VALUES
(4, '公司简介', 1, 1, '超级管理员', '2017-09-15 11:11:27', '2017-09-15 11:11:27'),
(5, '公司简介', 3, 1, '超级管理员', '2017-09-15 11:17:23', '2017-09-15 11:17:23'),
(7, '新闻平台', 6, 1, '超级管理员', '2017-09-15 11:18:05', '2017-09-15 11:18:05'),
(8, '公司人员', 3, 1, '超级管理员', '2017-09-15 11:18:21', '2017-09-15 11:18:21'),
(9, '公司背景', 2, 1, '超级管理员', '2017-09-15 11:18:58', '2017-09-15 11:18:58'),
(10, '公司背景', 6, 1, '超级管理员', '2017-09-15 11:19:40', '2017-09-15 11:19:40'),
(12, '公司背景1', 11, 1, '超级管理员', '2017-09-15 11:21:20', '2017-09-15 11:21:20'),
(25, '我的新', 19, 2, '刘婷', '2017-09-17 17:24:16', '2017-09-17 17:24:16'),
(26, '秋季新闻', 19, 1, '超级管理员', '2017-09-15 14:41:54', '2017-09-15 14:41:54'),
(27, '秋季新闻', 19, 1, '超级管理员', '2017-09-15 15:40:54', '2017-09-15 15:40:54'),
(28, '112', 19, 1, '超级管理员', '2017-09-15 16:12:21', '2017-09-15 16:12:21'),
(29, '1111', 19, 1, '超级管理员', '2017-09-15 16:13:37', '2017-09-15 16:13:37'),
(37, '111', 19, 2, '刘婷', '2017-09-17 17:25:56', '2017-09-17 17:25:56'),
(38, '111', 19, 2, '刘婷', '2017-09-17 17:26:25', '2017-09-17 17:26:25'),
(43, '111', 19, 2, '刘婷', '2017-09-17 18:07:09', '2017-09-17 18:07:09'),
(44, '111', 19, 2, '刘婷', '2017-09-17 18:07:16', '2017-09-17 18:07:16'),
(47, '我的爱好', 24, 2, '刘婷', '2017-09-17 18:33:41', '2017-09-17 18:33:41'),
(48, '215', 30, 2, '刘婷', '2017-09-17 18:33:51', '2017-09-17 18:33:51'),
(50, '石材城要', 49, 2, '刘婷', '2017-09-17 20:08:39', '2017-09-17 20:08:39'),
(53, '在地愿为连理枝', 49, 2, '刘婷', '2017-09-17 20:08:55', '2017-09-17 20:08:55'),
(54, '磊大', 51, 2, '刘婷', '2017-09-17 20:09:01', '2017-09-17 20:09:01'),
(61, '45454', 0, 2, '刘婷', '2017-09-17 20:46:00', '2017-09-17 20:46:00'),
(62, '4444444444444', 0, 2, '刘婷', '2017-09-17 20:46:04', '2017-09-17 20:46:04'),
(63, '454、57、', 0, 2, '刘婷', '2017-09-17 20:46:08', '2017-09-17 20:46:08'),
(64, '一扔和', 61, 2, '刘婷', '2017-09-17 20:46:17', '2017-09-17 20:46:17'),
(66, '硒鼓斯柯达', 62, 2, '刘婷', '2017-09-17 20:46:29', '2017-09-17 20:46:29');

-- --------------------------------------------------------

--
-- 表的结构 `news`
--

CREATE TABLE `news` (
  `news_id` int(11) NOT NULL COMMENT '主键',
  `title` char(240) COLLATE utf8_czech_ci NOT NULL COMMENT '信息标题',
  `cate_id_parent` int(11) NOT NULL COMMENT '一级分类的id',
  `cate_id_child` int(11) NOT NULL COMMENT '二级分类的id',
  `img` char(240) COLLATE utf8_czech_ci DEFAULT NULL COMMENT '保存图片路径',
  `detail` text COLLATE utf8_czech_ci COMMENT '详情',
  `model` char(240) COLLATE utf8_czech_ci DEFAULT NULL COMMENT '产品型号',
  `power` char(240) COLLATE utf8_czech_ci DEFAULT NULL COMMENT '功率',
  `colortemp` char(240) COLLATE utf8_czech_ci DEFAULT NULL COMMENT '色温',
  `views` int(11) NOT NULL DEFAULT '0' COMMENT '浏览次数',
  `admin_id` char(11) COLLATE utf8_czech_ci NOT NULL COMMENT '操作者主键ID',
  `realname` char(11) COLLATE utf8_czech_ci NOT NULL COMMENT '操作者的姓名',
  `addtimes` datetime NOT NULL COMMENT '添加时间',
  `updatetimes` datetime NOT NULL COMMENT '最后修改时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

--
-- 转存表中的数据 `news`
--

INSERT INTO `news` (`news_id`, `title`, `cate_id_parent`, `cate_id_child`, `img`, `detail`, `model`, `power`, `colortemp`, `views`, `admin_id`, `realname`, `addtimes`, `updatetimes`) VALUES
(1, '53525', 19, 27, NULL, '', NULL, NULL, NULL, 0, '1', '超级管理员', '2017-09-15 16:26:23', '2017-09-15 16:26:23'),
(2, '53525', 19, 27, NULL, '', NULL, NULL, NULL, 0, '1', '超级管理员', '2017-09-15 16:26:27', '2017-09-15 16:26:27'),
(3, '我的个人新闻', 19, 27, NULL, '<p><img src="http://localhost/project/upload/image/20170915/1505464022__banner4.png" title="1505464022__banner4.png" alt="banner4.png"/></p>', NULL, NULL, NULL, 0, '1', '超级管理员', '2017-09-15 16:31:42', '2017-09-15 16:31:42'),
(4, '我是秋季新闻下面的子元素的标题', 19, 27, NULL, '<p><span style="color: rgb(255, 0, 0);"><em><strong>我是秋季新闻下面的子元素的标题</strong></em></span></p>', NULL, NULL, NULL, 0, '1', '超级管理员', '2017-09-15 17:13:02', '2017-09-15 17:13:02'),
(5, '我的标题', 60, 65, NULL, '<p>顶替</p>', NULL, NULL, NULL, 0, '2', '刘婷', '2017-09-17 21:25:37', '2017-09-17 21:25:37'),
(6, '我的标题', 60, 65, NULL, '<p>顶替</p>', NULL, NULL, NULL, 0, '2', '刘婷', '2017-09-17 21:25:47', '2017-09-17 21:25:47'),
(7, '夺', 60, 65, NULL, '<p><img src="http://localhost/project/upload/image/20170917/1505654915__banner2.jpg" title="1505654915__banner2.jpg" alt="banner2.jpg"/></p>', NULL, NULL, NULL, 0, '2', '刘婷', '2017-09-17 21:28:42', '2017-09-17 21:28:42'),
(8, '夺', 57, 55, NULL, '<p><img src="http://localhost/project/upload/image/20170917/1505655075__banner1.jpg" title="1505655075__banner1.jpg" alt="banner1.jpg"/></p>', NULL, NULL, NULL, 0, '2', '刘婷', '2017-09-17 21:31:18', '2017-09-17 21:31:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `cate`
--
ALTER TABLE `cate`
  ADD PRIMARY KEY (`cate_id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`news_id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '管理员ID', AUTO_INCREMENT=3;
--
-- 使用表AUTO_INCREMENT `cate`
--
ALTER TABLE `cate`
  MODIFY `cate_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键', AUTO_INCREMENT=67;
--
-- 使用表AUTO_INCREMENT `news`
--
ALTER TABLE `news`
  MODIFY `news_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键', AUTO_INCREMENT=9;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
