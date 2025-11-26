-- CreateTable
CREATE TABLE `clientes` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(40) NOT NULL,
    `cpf` CHAR(11) NOT NULL,
    `telefone` CHAR(9) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `viagens` (
    `id_viagem` INTEGER NOT NULL AUTO_INCREMENT,
    `destino` VARCHAR(30) NOT NULL,
    `data_inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_fim` DATETIME(3) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_viagem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id_reserva` INTEGER NOT NULL AUTO_INCREMENT,
    `data_reserva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(100) NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_viagem` INTEGER NOT NULL,

    PRIMARY KEY (`id_reserva`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id_pagamento` INTEGER NOT NULL AUTO_INCREMENT,
    `valor` DECIMAL(10, 2) NOT NULL,
    `forma_pagamento` ENUM('PIX', 'Cartao', 'Dinheiro') NOT NULL,
    `data_pagamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_reserva` INTEGER NOT NULL,

    UNIQUE INDEX `pagamentos_id_reserva_key`(`id_reserva`),
    PRIMARY KEY (`id_pagamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_id_viagem_fkey` FOREIGN KEY (`id_viagem`) REFERENCES `viagens`(`id_viagem`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_id_reserva_fkey` FOREIGN KEY (`id_reserva`) REFERENCES `reservas`(`id_reserva`) ON DELETE RESTRICT ON UPDATE CASCADE;
