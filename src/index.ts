import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Set public permissions for GraphQL queries
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({
          where: { type: 'public' },
        });

      if (publicRole) {
        const contentTypes = ['faq', 'testimonial', 'account'];
        const actions = ['find', 'findOne'];

        for (const contentType of contentTypes) {
          for (const action of actions) {
            const actionName = `api::${contentType}.${contentType}.${action}`;
            
            // Check if permission already exists
            const existingPermission = await strapi
              .query('plugin::users-permissions.permission')
              .findOne({
                where: {
                  action: actionName,
                  role: publicRole.id,
                },
              });

            // Create permission if it doesn't exist
            if (!existingPermission) {
              await strapi
                .query('plugin::users-permissions.permission')
                .create({
                  data: {
                    action: actionName,
                    role: publicRole.id,
                  },
                });
            }
          }
        }
      }
    } catch (error) {
      // Silently fail if permissions can't be set (e.g., during build)
      console.error('Error setting public permissions:', error);
    }
  },
};
