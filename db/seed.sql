INSERT INTO barbearias (slug, nome, whatsapp)
VALUES ('navalha', 'Barbearia Navalha', '5511999990000');

INSERT INTO horarios_funcionamento (barbearia_id, dia_semana, abre, fecha)
SELECT b.id, d, '09:00', '19:00'
FROM barbearias AS b
CROSS JOIN generate_series(1, 6) AS d
WHERE b.slug = 'navalha';

INSERT INTO servicos (barbearia_id, nome, preco, duracao_min)
SELECT b.id, s.nome, s.preco, s.duracao
FROM barbearias AS b
CROSS JOIN (VALUES ('Corte', 40, 30), ('Barba', 30, 30), ('Corte + Barba', 65, 60))
  AS s (nome, preco, duracao)
WHERE b.slug = 'navalha';

INSERT INTO barbeiros (barbearia_id, nome)
SELECT b.id, equipe.nome
FROM barbearias AS b
CROSS JOIN (VALUES ('Carlos'), ('Rafael')) AS equipe (nome)
WHERE b.slug = 'navalha';
