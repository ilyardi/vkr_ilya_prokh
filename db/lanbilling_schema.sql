CREATE TABLE `teleset_saldos` (
  `saldo_id`        int(11) NOT NULL AUTO_INCREMENT,
  `agrm_id`         int(11) DEFAULT NULL COMMENT 'Идентификатор лицевого счета',
  `date`            date NOT NULL,

  `saldo_internet`        decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_internet_ones`   decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_internet_period` decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_tv`              decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_tv_ones`         decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_tv_period`       decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_video`           decimal(20,6) NOT NULL DEFAULT '0.000000',
  `saldo_other`           decimal(20,6) NOT NULL DEFAULT '0.000000',

  `fee_internet`          decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_internet_ones`     decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_internet_period`   decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_tv`                decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_tv_ones`           decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_tv_period`         decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_video`             decimal(20,6) NOT NULL DEFAULT '0.000000',
  `fee_other`             decimal(20,6) NOT NULL DEFAULT '0.000000',

  `payment_internet`      decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_internet_ones` decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_internet_period` decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_tv`            decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_tv_ones`       decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_tv_period`     decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_video`         decimal(20,6) NOT NULL DEFAULT '0.000000',
  `payment_other`         decimal(20,6) NOT NULL DEFAULT '0.000000',

  `created_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      datetime DEFAULT NULL,
  PRIMARY KEY (`saldo_id`),
  UNIQUE KEY `teleset_saldos_uniq` (`date`, `agrm_id`),
  KEY `agrm_id` (`agrm_id`),
  KEY `date` (`date`),
  CONSTRAINT `fk_teleset_saldos_agreements` FOREIGN KEY (`agrm_id`) REFERENCES `agreements` (`agrm_id`) ON UPDATE CASCADE,
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Сальдо по договору';


ALTER TABLE teleset_saldos ADD COLUMN correction_internet decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_internet_period decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_tv decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_tv_period decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_video decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_other decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN saldo_ud decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN fee_ud decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN payment_ud decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_ud decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN saldo_to_dom decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN fee_to_dom decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN payment_to_dom decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN correction_to_dom decimal(20,6) NOT NULL DEFAULT '0.000000';
ALTER TABLE teleset_saldos ADD COLUMN advance decimal(20,6) NOT NULL DEFAULT '0.000000';


----- 2021-06-13 -----
CREATE TABLE `teleset_bill_delivery_logs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL,
  `bill_delivery` tinyint(4) DEFAULT '1' COMMENT 'Способ доставки счета: 0-курьер, 1-почтой, 2-самостоятельно, 3-другой, 4-email',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  CONSTRAINT `fk_teleset_bill_delivery_logs_uid` FOREIGN KEY (`uid`) REFERENCES `accounts` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DELIMITER //
DROP TRIGGER IF EXISTS accounts_insert//
CREATE DEFINER=`root`@`localhost` TRIGGER accounts_insert AFTER INSERT ON `accounts`
FOR EACH ROW BEGIN
  IF @LB_DISABLE_TRIGGERS IS NULL OR @LB_DISABLE_TRIGGERS = 0 THEN
    insert into teleset_bill_delivery_logs (uid, bill_delivery, created_at) values(NEW.uid, NEW.bill_delivery, NOW());
  END IF;
END//
DELIMITER ;


DELIMITER //
DROP TRIGGER IF EXISTS backup_accounts_update//
CREATE DEFINER=`root`@`localhost` TRIGGER `backup_accounts_update` AFTER UPDATE ON `accounts`
FOR EACH ROW BEGIN
	IF @LB_DISABLE_TRIGGERS IS NULL OR @LB_DISABLE_TRIGGERS = 0 THEN
		INSERT INTO `accounts_backup`(`uid`, `uuid`, `mod_date`, `mod_person`,
			`login`, `pass`, `type`, `descr`, `name`, `phone`, `fax`, `email`,
			`bill_delivery`, `category`,
			`bank_name`, `branch_bank_name`, `treasury_name`, `treasury_account`,
			`bik`, `settl`, `corr`, `kpp`, `inn`, `ogrn`, `okpo`, `okved`,
			`gen_dir_u`, `gl_buhg_u`, `kont_person`, `act_on_what`,
			`u_address`, `f_address`, `b_address`,
			`pass_sernum`, `pass_no`, `pass_issuedate`, `pass_issuedep`, `pass_issueplace`, `birthdate`, `birthplace`, `addons`)
		VALUES (OLD.`uid`, OLD.`uuid`, NOW(), IFNULL(@mod_person, 0),
				OLD.`login`, OLD.`pass`, OLD.`type`, OLD.`descr`, OLD.`name`, OLD.`phone`, OLD.`fax`, OLD.`email`,
				OLD.`bill_delivery`, OLD.`category`,
				OLD.`bank_name`, OLD.`branch_bank_name`, OLD.`treasury_name`, OLD.`treasury_account`,
				OLD.`bik`, OLD.`settl`, OLD.`corr`, OLD.`kpp`, OLD.`inn`, OLD.`ogrn`, OLD.`okpo`, OLD.`okved`,
				OLD.`gen_dir_u`, OLD.`gl_buhg_u`, OLD.`kont_person`, OLD.`act_on_what`,
				ADDRESS_FORMAT(0, OLD.`uid`, '%Y, %I, %R, %A, %C, %L, %S, %B, %F'),
				ADDRESS_FORMAT(1, OLD.`uid`, '%Y, %I, %R, %A, %C, %L, %S, %B, %F'),
				ADDRESS_FORMAT(2, OLD.`uid`, '%Y, %I, %R, %A, %C, %L, %S, %B, %F'),
				OLD.`pass_sernum`, OLD.`pass_no`, OLD.`pass_issuedate`, OLD.`pass_issuedep`, OLD.`pass_issueplace`, OLD.`birthdate`, OLD.`birthplace`,
				(SELECT GROUP_CONCAT(CONCAT(`v`.`name`, '=', IF(`v`.`value` IS NULL, `v`.`str_value`, `s`.`value`)) SEPARATOR ';')
					FROM `accounts_addons_vals` `v` LEFT JOIN `accounts_addons_staff` `s` ON `s`.`idx` = `v`.`value` WHERE `v`.`uid` = OLD.`uid` GROUP BY `v`.`uid`));
		UPDATE `applications` SET `username` = OLD.`name` WHERE `uid` = OLD.`uid`;

    IF OLD.bill_delivery <> NEW.bill_delivery THEN
      insert into teleset_bill_delivery_logs (uid, bill_delivery, created_at) values(NEW.uid, NEW.bill_delivery, NOW());
    END IF;
	END IF;
END//
DELIMITER ;

CREATE TABLE `teleset_agreements` (
  `agrm_id` int(11) NOT NULL,
  `activated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`agrm_id`),
  CONSTRAINT `fk_teleset_agreements_agrm_id` FOREIGN KEY (`agrm_id`) REFERENCES `agreements` (`agrm_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

----- END -----


CREATE TABLE `teleset_charges` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `agrm_id`      int(11) NOT NULL,
  `month`        date NOT NULL,
  `fee`          decimal(20,6) NOT NULL DEFAULT '0.000000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `teleset_charges_uniq` (`month`, `agrm_id`),
  CONSTRAINT `fk_teleset_charges_agrm_id` FOREIGN KEY (`agrm_id`) REFERENCES `agreements` (`agrm_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- INSERT INTO teleset_charges (agrm_id, month, fee)
-- SELECT agrm_id, DATE_FORMAT(period, '%Y-%m-01') as month, sum(amount) as fee
-- FROM {charges|rentcharge|usbox_charge}
-- WHERE amount > 0
-- GROUP BY agrm_id, month
--   ON DUPLICATE KEY UPDATE fee = fee + VALUES(fee);

DELIMITER ;;
DROP PROCEDURE IF EXISTS CHARGE_IMPL;;
CREATE DEFINER=`billing`@`localhost` PROCEDURE `CHARGE_IMPL`(IN in_vg_id int, IN in_agrm_id int, IN in_date date, IN in_c_date date, IN in_amount double)
    MODIFIES SQL DATA
    SQL SECURITY INVOKER
    COMMENT 'Используется триггерами для выполнения списаний'
BEGIN
    IF round(in_amount, 6) <> 0.000000 THEN
        UPDATE `agreements` SET `balance` = `balance` - in_amount WHERE `agrm_id` = in_agrm_id;
        UPDATE `balances` SET `balance` = `balance` - in_amount WHERE `agrm_id` = in_agrm_id AND `date` > in_date;

        -- vlad addon begin
        INSERT INTO teleset_charges (agrm_id, month, fee)
        VALUES(in_agrm_id, DATE_FORMAT(in_date, '%Y-%m-01'), in_amount)
          ON DUPLICATE KEY UPDATE fee = fee + in_amount;
        -- vladd addon end

        IF in_c_date > '0000-00-00' THEN
            SET @LB_DISABLE_TRIGGERS = 1;
            UPDATE `vgroups` SET `amount` = `amount` + in_amount WHERE `vg_id` = in_vg_id AND in_c_date = `c_date`;
            SET @LB_DISABLE_TRIGGERS = NULL;
        END IF;
    END IF;
END ;;
DELIMITER ;


