-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Oct 31, 2024 at 01:58 PM
-- Server version: 8.0.35
-- PHP Version: 8.2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `exp1`
--

-- --------------------------------------------------------

--
-- Table structure for table `comparison`
--

CREATE TABLE `comparison` (
  `id` int NOT NULL,
  `website` varchar(512) NOT NULL,
  `url` varchar(512) NOT NULL,
  `data` json NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crawler`
--

CREATE TABLE `crawler` (
  `id` int NOT NULL,
  `website` varchar(512) NOT NULL,
  `url` varchar(512) NOT NULL,
  `data` json NOT NULL,
  `compared` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website`
--

CREATE TABLE `website` (
  `id` int NOT NULL,
  `url` varchar(512) NOT NULL,
  `tranco_rank` int DEFAULT NULL,
  `status` enum('0','1','2') NOT NULL DEFAULT '0',
  `called` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `website`
--

INSERT INTO `website` (`id`, `url`, `tranco_rank`, `status`, `called`) VALUES
(1, 'google.com', NULL, '0', 0),
(2, 'microsoft.com', NULL, '0', 0),
(3, 'amazonaws.com', NULL, '0', 0),
(4, 'facebook.com', NULL, '0', 0),
(5, 'root-servers.net', NULL, '0', 0),
(6, 'apple.com', NULL, '0', 0),
(7, 'akamai.net', NULL, '0', 0),
(8, 'a-msedge.net', NULL, '0', 0),
(9, 'youtube.com', NULL, '0', 0),
(10, 'azure.com', NULL, '0', 0),
(11, 'googleapis.com', NULL, '0', 0),
(12, 'twitter.com', NULL, '0', 0),
(13, 'akamaiedge.net', NULL, '0', 0),
(14, 'cloudflare.com', NULL, '0', 0),
(15, 'instagram.com', NULL, '0', 0),
(16, 'mail.ru', NULL, '0', 0),
(17, 'gstatic.com', NULL, '0', 0),
(18, 'office.com', NULL, '0', 0),
(19, 'linkedin.com', NULL, '0', 0),
(20, 'live.com', NULL, '0', 0),
(21, 'tiktokcdn.com', NULL, '0', 0),
(22, 'googletagmanager.com', NULL, '0', 0),
(23, 'googlevideo.com', NULL, '0', 0),
(24, 'dzen.ru', NULL, '0', 0),
(25, 'akadns.net', NULL, '0', 0),
(26, 'windowsupdate.com', NULL, '0', 0),
(27, 'microsoftonline.com', NULL, '0', 0),
(28, 'doubleclick.net', NULL, '0', 0),
(29, 'fbcdn.net', NULL, '0', 0),
(30, 'amazon.com', NULL, '0', 0),
(31, 'gtld-servers.net', NULL, '0', 0),
(32, 'googleusercontent.com', NULL, '0', 0),
(33, 'wikipedia.org', NULL, '0', 0),
(34, 'trafficmanager.net', NULL, '0', 0),
(35, 'bing.com', NULL, '0', 0),
(36, 'apple-dns.net', NULL, '0', 0),
(37, 'l-msedge.net', NULL, '0', 0),
(38, 'fastly.net', NULL, '0', 0),
(39, 'office.net', NULL, '0', 0),
(40, 'icloud.com', NULL, '0', 0),
(41, 'googlesyndication.com', NULL, '0', 0),
(42, 'wordpress.org', NULL, '0', 0),
(43, 'sharepoint.com', NULL, '0', 0),
(44, 't-msedge.net', NULL, '0', 0),
(45, 'youtu.be', NULL, '0', 0),
(46, 'github.com', NULL, '0', 0),
(47, 'domaincontrol.com', NULL, '0', 0),
(48, 'aaplimg.com', NULL, '0', 0),
(49, 'netflix.com', NULL, '0', 0),
(50, 'whatsapp.net', NULL, '0', 0),
(51, 'pinterest.com', NULL, '0', 0),
(52, 'yahoo.com', NULL, '0', 0),
(53, 'digicert.com', NULL, '0', 0),
(54, 's-msedge.net', NULL, '0', 0),
(55, 'appsflyersdk.com', NULL, '0', 0),
(56, 'cloudfront.net', NULL, '0', 0),
(57, 'adobe.com', NULL, '0', 0),
(58, 'goo.gl', NULL, '0', 0),
(59, 'windows.net', NULL, '0', 0),
(60, 'spotify.com', NULL, '0', 0),
(61, 'vimeo.com', NULL, '0', 0),
(62, 'cdn77.org', NULL, '0', 0),
(63, 'tiktokv.com', NULL, '0', 0),
(64, 'skype.com', NULL, '0', 0),
(65, 'gvt2.com', NULL, '0', 0),
(66, 'whatsapp.com', NULL, '0', 0),
(67, 'gvt1.com', NULL, '0', 0),
(68, 'google-analytics.com', NULL, '0', 0),
(69, 'bit.ly', NULL, '0', 0),
(70, 'msn.com', NULL, '0', 0),
(71, 'yandex.net', NULL, '0', 0),
(72, 'zoom.us', NULL, '0', 0),
(73, 'gandi.net', NULL, '0', 0),
(74, 'nic.ru', NULL, '0', 0),
(75, 'wordpress.com', NULL, '0', 0),
(76, 'ntp.org', NULL, '0', 0),
(77, 'bytefcdn-oversea.com', NULL, '0', 0),
(78, 'wac-msedge.net', NULL, '0', 0),
(79, 'cloudflare.net', NULL, '0', 0),
(80, 'office365.com', NULL, '0', 0),
(81, 'roblox.com', NULL, '0', 0),
(82, 'qq.com', NULL, '0', 0),
(83, 'tiktok.com', NULL, '0', 0),
(84, 'edgekey.net', NULL, '0', 0),
(85, 'ytimg.com', NULL, '0', 0),
(86, 'blogspot.com', NULL, '0', 0),
(87, 'e2ro.com', NULL, '0', 0),
(88, 'comcast.net', NULL, '0', 0),
(89, 'cloudflare-dns.com', NULL, '0', 0),
(90, 'mozilla.org', NULL, '0', 0),
(91, 'opera.com', NULL, '0', 0),
(92, 'unity3d.com', NULL, '0', 0),
(93, 'reddit.com', NULL, '0', 0),
(94, 'cdninstagram.com', NULL, '0', 0),
(95, 'googledomains.com', NULL, '0', 0),
(96, 'googleadservices.com', NULL, '0', 0),
(97, 'baidu.com', NULL, '0', 0),
(98, 'x.com', NULL, '0', 0),
(99, 'snapchat.com', NULL, '0', 0),
(100, 'intuit.com', NULL, '0', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comparison`
--
ALTER TABLE `comparison`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`);

--
-- Indexes for table `crawler`
--
ALTER TABLE `crawler`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`);

--
-- Indexes for table `website`
--
ALTER TABLE `website`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comparison`
--
ALTER TABLE `comparison`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crawler`
--
ALTER TABLE `crawler`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website`
--
ALTER TABLE `website`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1001;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
