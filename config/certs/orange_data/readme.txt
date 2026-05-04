Генерируем закрытый ключ с паролем зашифрованным алгоритмом AES256 и длинной 2048 Кбит:

    $ openssl genrsa -out orange_data_private.key -aes256 2048

Чтобы сгенерировать ключ без пароля, надо убрать -aes256. Если хотите ключ длиннее 2048 Кбит, то замените 2048 число на необходимое.

Генерируем открытый ключ:

    $ openssl rsa -in orange_data_private.key -pubout -out orange_data_public.key

и преобразовываем его из pem-формата в xml

    https://superdry.apphb.com/tools/online-rsa-key-converter
