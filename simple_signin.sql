create table user(
	id int not null auto_increment,
	username varchar(20) not null,
	realname varchar(255) not null,
	password varchar(255) not null,
	email varchar(50) not null,
	primary key (id,username)
);
create table sign(
	id int not null auto_increment primary key,
	userid int not null,
	is_sign_in tinyint not null comment '1:sign_in ,0:sign out',
	sign_time datetime not null,
	sign_date datetime not null,
	should_sign_time datetime not null,
	sign_status varchar(10) comment '目前能想到的有：正常，迟到，早到，早退，加班，五种状态'
);