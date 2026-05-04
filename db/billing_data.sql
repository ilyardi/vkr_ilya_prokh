begin;

INSERT INTO `accounts` (`uid`, `uuid`, `login`, `pass`, `ipaccess`, `type`, `descr`, `name`, `phone`, `fax`, `email`, `mobile`, `bill_delivery`, `category`, `bank_name`, `branch_bank_name`, `treasury_name`, `treasury_account`, `bik`, `settl`, `corr`, `kpp`, `inn`, `ogrn`, `okpo`, `okved`, `gen_dir_u`, `gl_buhg_u`, `kont_person`, `act_on_what`, `pass_sernum`, `pass_no`, `pass_issuedate`, `pass_issuedep`, `pass_issueplace`, `birthdate`, `birthplace`, `last_mod_date`, `wrong_active`, `wrong_date`, `oksm`, `okato`, `template`, `archive`, `ownership`, `abonent_name`, `abonent_surname`, `abonent_patronymic`, `rid`, `set_id`, `mobile_is_confirmed`, `email_is_confirmed`, `pass_is_temporary`, `last_contact_data_reminder`, `offer_is_accepted`)
VALUES
	(26421, NULL, 'druzhininv', 'druzhininv', 0, 2, '', 'Дружинин Владислав Викторович', '79035327090', '', 'vlad@druzh.ru', '79035327090', 2, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2006-02-07', 'Паспортным столом №1 ОВД г.Дубны', 'Московская область', '1985-10-01', 'г. Дубна, Московская обл.', '2021-10-27 14:24:33', 0, '0000-00-00 00:00:00', 643, '', 0, 0, 0, 'Владислав', 'Дружинин', 'Викторович', NULL, NULL, 0, 0, 0, NULL, 0),
	(854, NULL, 'druzhinin7206', '7CBqfH', 0, 2, 'Поварова Ирина Викторовна 79051645000 irina.v.povarova@ya.ru 4607 987933 2008-04-24 ТП №1 ОУФМС России по МО в г. Дубна 1988-04-08 г. Дубна Московской области', 'Дружинин Владислав Викторович', '9035327090', '', 'vlad@druzh.ru', '79035327090', 2, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2006-02-07', 'Паспортным столом №1 ОВД г. Дубны МО', '', '1985-10-01', 'г.Дубна Московской области', '2021-06-22 10:36:02', 0, '0000-00-00 00:00:00', 643, '', 0, 0, 0, 'Владислав', 'Дружинин', 'Викторович', X'294D6241CCFF11E69FBFF4CE4682C7B8', NULL, 0, 0, 0, NULL, 0),
	(15342, NULL, 'prohpa151282', '9575174223', 0, 2, 'Бодрягин Алексей Николаевич\r\n89037284205\r\n4600 785758\r\n2001-06-18\r\nДубненским ГОВД Московской обл.\r\n1976-07-19\r\nг.Туймазы Респ.Башкортостан\r\nРоссия, обл Московская, г Дубна, ул академика Б.М.Понтекорво, дом 6, кв 19, 141985\r\nзаявление №1398 от 04.12.2008 на БП\r\nзаявление № 276 от 05.03.2009 на ОТКЛ Прох П. А. Кадастровый номер 50:40:0020108:251 от 14.04.2014', 'Дружинин Владислав Викторович', '9035327090', '', 'vlad@druzh.ru', '79035327090', 2, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2006-02-07', 'Паспортным столом №1 ОВД г. Дубны МО', '', '1985-10-01', 'г.Дубна Московской области', '2021-06-13 23:27:06', 0, '0000-00-00 00:00:00', 643, '', 0, 0, 0, 'Владислав', 'Дружинин', 'Викторович', X'45521A286A1A11E79FBFF4CE4682C7B8', NULL, 0, 0, 0, NULL, 0);

INSERT INTO `accounts` (`uid`, `uuid`, `login`, `pass`, `ipaccess`, `type`, `descr`, `name`, `phone`, `fax`, `email`, `mobile`, `bill_delivery`, `category`, `bank_name`, `branch_bank_name`, `treasury_name`, `treasury_account`, `bik`, `settl`, `corr`, `kpp`, `inn`, `ogrn`, `okpo`, `okved`, `gen_dir_u`, `gl_buhg_u`, `kont_person`, `act_on_what`, `pass_sernum`, `pass_no`, `pass_issuedate`, `pass_issuedep`, `pass_issueplace`, `birthdate`, `birthplace`, `last_mod_date`, `wrong_active`, `wrong_date`, `oksm`, `okato`, `template`, `archive`, `ownership`, `abonent_name`, `abonent_surname`, `abonent_patronymic`, `rid`, `set_id`, `mobile_is_confirmed`, `email_is_confirmed`, `pass_is_temporary`, `last_contact_data_reminder`, `offer_is_accepted`)
VALUES
	(1, NULL, 'customer_root', 'sd93ud98d', 0, 1, '', 'Общество с ограниченной ответственностью «ТЕЛЕСЕТЬ»', '4962122681', '79151285552', 'secretar@teleset.plus,video-cams@mail.ru ', NULL, 2, 1, 'ПАО СБЕРБАНК', '', '', '', '044525225', '40702810040000018570', '30101810400000000225', '501001001', '5010050793', '1155010001893', '01385551', '', 'Клетов Дмитрий Алексеевич', 'Доля Татьяна Александровна', 'Лачина Алина', 'Устава', '', '', NULL, '', '', NULL, '', '2021-07-14 21:55:53', 0, '0000-00-00 00:00:00', 643, '', 0, 0, 0, '', '', '', X'EC3BD1A383F811E687A4F4CE4682C7B8', NULL, 0, 0, 0, NULL, 0);


INSERT INTO `dict_okv` (`record_id`, `name`, `code_name`, `countries`)
VALUES
	(643, 'Российский рубль', 'RUB', 'Россия');


INSERT INTO `currency` (`id`, `symbol`, `name`, `code_okv`)
VALUES
	(0, 'р.е.', 'Расчетная единица', NULL),
	(1, 'руб', 'RUR', 643);


INSERT INTO `agreements` (`agrm_id`, `uid`, `oper_id`, `number`, `date`, `balance`, `credit`, `installments`, `cur_id`, `code`, `archive`, `balance_acc`, `parent_agrm_id`, `owner_id`, `state`, `last_mod_date`, `rid`)
VALUES
	(26163, 26421, 1, 'Ю00010/18', '2018-12-10', -2400.000000, 0.000000, 0.000000, 1, NULL, 0, 0.000000, NULL, 1, 0, '2019-05-21 12:24:29', NULL);

INSERT INTO `agreements` (`agrm_id`, `uid`, `oper_id`, `number`, `date`, `balance`, `credit`, `installments`, `cur_id`, `code`, `archive`, `balance_acc`, `parent_agrm_id`, `owner_id`, `state`, `last_mod_date`, `rid`)
VALUES
	(815, 854, 1, '9993743', '2016-10-25', -800.000000, 0.000000, 0.000000, 1, NULL, 0, 1200.000000, NULL, 1, 0, '2021-02-01 00:01:53', X'2951C902CCFF11E69FBFF4CE4682C7B8');

INSERT INTO `agreements` (`agrm_id`, `uid`, `oper_id`, `number`, `date`, `balance`, `credit`, `installments`, `cur_id`, `code`, `archive`, `balance_acc`, `parent_agrm_id`, `owner_id`, `state`, `last_mod_date`, `rid`)
VALUES
	(15190, 15342, 1, '4060820', '2009-08-26', 0.000000, 0.000000, 0.000000, 1, NULL, 0, 2560.000000, NULL, NULL, 0, '2021-04-26 11:53:00', X'455DCEA66A1A11E79FBFF4CE4682C7B8');

commit;
