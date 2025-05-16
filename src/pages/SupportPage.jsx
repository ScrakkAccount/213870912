
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Mail, MessageSquare, HelpCircle, ExternalLink } from 'lucide-react';

    const SupportPage = () => {
      const supportEmail = "jcgtmgm@gmail.com";
      const discordInviteLink = "https://discord.gg/EQYW57pdDM";

      const contactOptions = [
        {
          icon: <Mail className="h-8 w-8 text-primary" />,
          title: "Soporte por Email",
          description: "Envíanos un correo electrónico para consultas detalladas o problemas técnicos.",
          actionText: `Contactar: ${supportEmail}`,
          actionLink: `mailto:${supportEmail}`,
          type: "email"
        },
        {
          icon: <MessageSquare className="h-8 w-8 text-primary" />,
          title: "Comunidad de Discord",
          description: "Únete a nuestro servidor de Discord para soporte rápido y discusiones con la comunidad.",
          actionText: "Unirse al Servidor",
          actionLink: discordInviteLink,
          type: "discord"
        }
      ];

      const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: i * 0.2,
            duration: 0.6,
            ease: "easeOut"
          }
        })
      };

      return (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <HelpCircle className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-5xl font-extrabold mb-4 gradient-text">Centro de Soporte</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ¿Necesitas ayuda? Estamos aquí para asistirte. Elige tu método de contacto preferido.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {contactOptions.map((option, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-8 rounded-xl glassmorphism shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary/20 rounded-full mr-4">
                    {option.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">{option.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">{option.description}</p>
                <Button
                  onClick={() => window.open(option.actionLink, option.type === "discord" ? '_blank' : '_self')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-md py-3 mt-auto"
                >
                  {option.actionText}
                  {option.type === "discord" && <ExternalLink className="ml-2 h-4 w-4" />}
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="mt-16 p-8 rounded-xl glassmorphism shadow-lg text-center"
          >
            <h3 className="text-2xl font-semibold mb-3 text-foreground">Horario de Soporte</h3>
            <p className="text-muted-foreground">
              Nuestro equipo de soporte está disponible de Lunes a Viernes, de 9:00 AM a 6:00 PM (GMT-5).
              <br />
              Intentamos responder a todas las consultas en un plazo de 24 horas hábiles.
            </p>
          </motion.div>
        </div>
      );
    };

    export default SupportPage;
  